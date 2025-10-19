import { ActionFunctionArgs } from "@remix-run/node";
import { extractImageData, type ReceiptDataExtract } from "../openai.server";
import { getUserFromRequest } from "~/lib/user";
import { ReceiptExtractionError } from "~/errors";
import prisma from "~/prisma.server";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import { receiptQueue } from "~/workers/receiptQueue.server";

// S3 client configuration
const s3Config = {
  region: process.env.AWS_REGION || "us-east-1",
  credentials:
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        }
      : undefined,
};

const s3 = new S3Client(s3Config);

// Helper function to upload file to S3 and get URLs
async function uploadFileToS3(file: File, user: any): Promise<{ fileKey: string; presignedUrl: string; s3Url: string }> {
  const fileKey = `receipts/${user.id}/${uuidv4()}-${file.name}`;
  const fileBuffer = await file.arrayBuffer();

  console.log("📤 Uploading file to S3:", {
    bucket: process.env.S3_BUCKET,
    key: fileKey,
    size: file.size,
    fileName: file.name,
  });

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: fileKey,
      Body: Buffer.from(fileBuffer),
      ContentType: file.type,
      Metadata: {
        userId: user.id,
        originalName: file.name,
      },
    })
  );

  // Generate a presigned URL for OpenAI
  const getObjectCommand = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: fileKey,
  });

  const presignedUrl = await getSignedUrl(s3, getObjectCommand, {
    expiresIn: 15 * 60, // 15 minutes
  });

  // Generate S3 URL
  const s3Url = process.env.S3_PUBLIC_BASE
    ? `${process.env.S3_PUBLIC_BASE}/${fileKey}`
    : `https://${process.env.S3_BUCKET}.s3.${
        process.env.AWS_REGION || "us-east-1"
      }.amazonaws.com/${fileKey}`;

  console.log("✅ File uploaded to S3:", s3Url);

  return { fileKey, presignedUrl, s3Url };
}

// Helper function to handle category creation/lookup
async function getOrCreateCategory(extractedCategory: string | undefined, user: any, existingCategoryId: string | null): Promise<string | null> {
  if (existingCategoryId) {
    return existingCategoryId;
  }

  if (!extractedCategory) {
    return null;
  }

  // Normalize category name
  const normalizedCategory = extractedCategory.trim();

  // Check if category already exists for this user
  const existingCategory = await prisma.category.findFirst({
    where: {
      user_id: user.id,
      name: {
        equals: normalizedCategory,
        mode: "insensitive",
      },
    },
  });

  if (existingCategory) {
    console.log(`Using existing category: ${normalizedCategory}`);
    return existingCategory.id;
  }

  // Create new category for this user
  const validCategories = [
    "Retail",
    "Dining",
    "Travel",
    "Services",
    "Financial",
    "Entertainment",
    "Utilities",
    "Returns",
    "Business",
    "Government",
    "Other",
  ];

  // Validate the category from OpenAI
  const isValidCategory = validCategories.includes(normalizedCategory);
  const finalCategoryName = isValidCategory ? normalizedCategory : "Other";

  const newCategory = await prisma.category.create({
    data: {
      user_id: user.id,
      name: finalCategoryName,
      description: `Automatically created from receipt analysis`,
    },
  });

  console.log(`Created new category: ${finalCategoryName}`);
  return newCategory.id;
}

// Real-time processing for single files
async function processReceiptFile(
  file: File,
  user: any,
  category_id: string | null
): Promise<any> {
  console.log("🔄 Starting REAL-TIME processing for single file:", file.name);
  
  // 1. Upload file to S3
  const { fileKey, presignedUrl, s3Url } = await uploadFileToS3(file, user);

  // 2. Extract receipt data using OpenAI
  let extractedData: ReceiptDataExtract;
  try {
    extractedData = await extractImageData(presignedUrl);
    console.log("✅ OpenAI extraction successful for single file:", file.name);
  } catch (error) {
    console.error("❌ OpenAI extraction failed for single file:", file.name, error);

    if (error instanceof ReceiptExtractionError) {
      throw new Error("Missing receipt or blurry image.");
    }

    // Create receipt with just the file info if extraction fails
    const receipt = await prisma.receipt.create({
      data: {
        user_id: user.id,
        company_name: "Unknown - Extraction Failed",
        purchase_date: new Date(),
        sub_total: 0,
        tax_amount: 0,
        total_amount: 0,
        currency: "JMD",
        image_filename: file.name,
        image_mime_type: file.type,
        image_s3_url: s3Url,
        category_id: category_id || null,
      },
    });

    return {
      state: "success",
      message: "Unable to parse; Receipt uploaded to S3 and was saved with minimal data",
      data: receipt,
    };
  }

  // 3. Handle category
  const categoryId = await getOrCreateCategory(extractedData.category, user, category_id);

  // 4. Parse and validate extracted data
  const purchaseDate = extractedData.purchase_date
    ? new Date(extractedData.purchase_date)
    : new Date();

  const subTotal = parseFloat(extractedData.sub_total) || 0;
  const taxAmount = parseFloat(extractedData.tax_total) || 0;
  const totalAmount =
    parseFloat(extractedData.total) ||
    parseFloat(extractedData.totalAmount) ||
    0;

  // 5. Create receipt in database WITH S3 URL
  const receipt = await prisma.receipt.create({
    data: {
      user_id: user.id,
      company_name: extractedData.merchant_name || "Unknown Merchant",
      company_address: extractedData.merchant_address || null,
      purchase_date: purchaseDate,
      sub_total: subTotal,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      currency: extractedData.currency || "JMD",
      image_filename: file.name,
      image_mime_type: file.type,
      image_s3_url: s3Url,
      items_json: extractedData.items || [],
      category_id: categoryId,
      notes: `Extracted items: ${extractedData.items?.length || 0} items`,
    },
    include: {
      category: true,
    },
  });

  console.log("✅ Receipt created in database (real-time):", receipt.id);

  return {
    state: "success",
    message: "Receipt uploaded and analyzed successfully",
    data: receipt,
  };
}

// Queue multiple files for background processing
async function queueMultipleFilesForProcessing(
  files: File[],
  user: any,
  category_id: string | null
): Promise<{ successCount: number; failedCount: number }> {
  console.log(`🚀 Starting BACKGROUND processing for ${files.length} files:`, files.map(f => f.name));
  
  let successCount = 0;
  let failedCount = 0;
  
  for (const [index, file] of files.entries()) {
    try {
      console.log(`📦 Processing file ${index + 1}/${files.length}: ${file.name}`);
      
      // Upload file to S3
      const { fileKey, presignedUrl, s3Url } = await uploadFileToS3(file, user);
      
      // Create minimal receipt record in "processing" state
      const receipt = await prisma.receipt.create({
        data: {
          user_id: user.id,
          company_name: "Processing...",
          purchase_date: new Date(),
          sub_total: 0,
          tax_amount: 0,
          total_amount: 0,
          currency: "JMD",
          image_filename: file.name,
          image_mime_type: file.type,
          image_s3_url: s3Url,
          category_id: category_id || null,
          status: "processing",
        },
      });

      console.log(`📝 Created minimal receipt record: ${receipt.id} for file: ${file.name}`);

      // Add job to queue with all necessary data - DO NOT AWAIT this!
      receiptQueue.add(
        'receiptDataExtractor',
        {
          receiptId: receipt.id,
          presignedUrl,
          userId: user.id,
          categoryId: category_id,
          fileName: file.name,
          fileType: file.type,
          s3Url,
        },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          removeOnComplete: 10,
          removeOnFail: 20,
        }
      ).then((job) => {
        console.log(`✅ Successfully queued job ${job.id} for receipt ${receipt.id} (file: ${file.name})`);
      }).catch((error) => {
        console.error(`❌ Failed to queue job for file ${file.name}:`, error);
      });

      successCount++;
      
    } catch (error) {
      console.error(`❌ Failed to process file ${file.name}:`, error);
      failedCount++;
    }
  }

  console.log(`🎯 Background processing initiated: ${successCount} successful, ${failedCount} failed`);
  return { successCount, failedCount };
}

// Helper function to validate files
function validateFile(file: File): Response | null {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "application/pdf",
  ];

  if (!allowedTypes.includes(file.type)) {
    return new Response(
      JSON.stringify({
        state: "failure",
        message: "Invalid file type. Only images (JPEG, PNG, WebP) and PDFs are allowed.",
        data: [],
      }),
      {
        status: 422,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      }
    );
  }

  // Validate file size (10MB max)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return new Response(
      JSON.stringify({
        state: "failure",
        message: "File too large. Maximum size is 10MB.",
        data: [],
      }),
      {
        status: 422,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      }
    );
  }

  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  // const { user } = await getUserFromRequest(request);

    const user = {
    id: "7b4f24d6-2e05-43fe-9531-18e051320b40", // Mock UUID
    email: "test@example.com",
    name: "Test User",
    first_name: "Test",
    last_name: "User",
  };

  if (!user) {
    return new Response(
      JSON.stringify({
        state: "failure",
        message: "you are not currently logged in.",
        data: [],
      }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      }
    );
  }

  // Check if request is multipart/form-data
  const contentType = request.headers.get("content-type");
  if (!contentType || !contentType.includes("multipart/form-data")) {
    return new Response(
      JSON.stringify({
        state: "failure",
        message: "Content-Type must be multipart/form-data",
        data: [],
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      }
    );
  }

  try {
    const formData = await request.formData();
    
    // Get ALL files with field name 'image' (Postman sends multiple with same name)
    const allImageFiles = formData.getAll("image") as File[];
    
    const category_id = formData.get("category_id") as string | null;

    console.log("📨 Received upload request:", {
      totalFilesReceived: allImageFiles.length,
      fileNames: allImageFiles.map(f => f.name),
      category_id,
      userId: user.id
    });

    // Check if S3 is properly configured
    if (!process.env.S3_BUCKET) {
      console.error("❌ S3_BUCKET environment variable is missing");
      return new Response(
        JSON.stringify({
          state: "failure",
          message: "S3 storage is not configured",
          data: [],
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
        }
      );
    }

    // Filter out empty files
    const validFiles = allImageFiles.filter(file => file && file.size > 0);

    if (validFiles.length === 0) {
      console.log("❌ No valid files found");
      return new Response(
        JSON.stringify({
          state: "failure",
          message: "No files submitted or files are empty",
          data: [],
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
        }
      );
    }

    // Validate all files first
    const validationErrors: string[] = [];
    const finalValidFiles: File[] = [];

    for (const file of validFiles) {
      const validationError = validateFile(file);
      if (validationError) {
        const errorMessage = `File ${file.name}: ${JSON.parse((await validationError.text())).message}`;
        validationErrors.push(errorMessage);
        console.log(`❌ File validation failed: ${errorMessage}`);
      } else {
        finalValidFiles.push(file);
        console.log(`✅ File validated: ${file.name}`);
      }
    }

    if (finalValidFiles.length === 0) {
      console.log("❌ No valid files after validation");
      return new Response(
        JSON.stringify({
          state: "failure",
          message: "No valid files submitted. " + validationErrors.join("; "),
          data: [],
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
        }
      );
    }

    // Handle single file (real-time processing)
    if (finalValidFiles.length === 1) {
      console.log("🎯 Detected SINGLE file upload mode for file:", finalValidFiles[0].name);
      
      console.log("🔄 Starting real-time processing for single file...");
      const result = await processReceiptFile(finalValidFiles[0], user, category_id);
      
      const status = result.state === "success" ? 201 : 200;
      console.log(`✅ Single file processing completed with status: ${status}`);
      
      return new Response(JSON.stringify(result), {
        status,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      });
    }

    // Handle multiple files (background processing)
    console.log(`🎯 Detected MULTIPLE file upload mode with ${finalValidFiles.length} files`);
    console.log(`✅ Validated ${finalValidFiles.length} files, starting background queuing...`);

    // Queue files for background processing - DON'T AWAIT THIS!
    const queueResultPromise = queueMultipleFilesForProcessing(finalValidFiles, user, category_id);

    // Return immediate 202 response WITHOUT waiting for queueing to complete
    console.log(`📨 Returning IMMEDIATE 202 response for ${finalValidFiles.length} files - processing continues in background`);

    // Log queueing result in background without blocking response
    queueResultPromise.then(({ successCount, failedCount }) => {
      console.log(`🎯 Background queueing completed: ${successCount} queued, ${failedCount} failed`);
    }).catch(error => {
      console.error("❌ Background queueing failed:", error);
    });

    // Return immediate response
    return new Response(
      JSON.stringify({
        state: "success",
        message: `Started processing ${finalValidFiles.length} receipt(s) in the background. You will receive notifications when complete.`,
        data: {
          filesQueued: finalValidFiles.length,
          fileNames: finalValidFiles.map(f => f.name),
          processingInBackground: true,
          timestamp: new Date().toISOString(),
          immediateResponse: true,
        },
      }),
      {
        status: 202, // Accepted
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      }
    );

  } catch (error) {
    console.error("💥 Error processing receipt upload:", error);

    return new Response(
      JSON.stringify({
        state: "failure",
        message: "Internal server error",
        data: [],
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      }
    );
  }
}