import { ActionFunctionArgs } from "@remix-run/node";
import { extractImageData, type ReceiptDataExtract } from "../openai.server";
import { getUserFromRequest } from "~/lib/user";
import prisma from "~/prisma.server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

// S3 client configuration
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function action({ request }: ActionFunctionArgs) {
  const { user } = await getUserFromRequest(request);

  if (!user) {
    return new Response(
      JSON.stringify({
        state: "failure",
        message: "Unauthorized",
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
    const file = formData.get("image") as File; // Changed from "file" to "image" to match Postman

    if (!file || file.size === 0) {
      return new Response(
        JSON.stringify({
          state: "failure",
          message: "No file submitted or file is empty",
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

    const category_id = formData.get("category_id") as string | null;

    // Validate file type
    const allowedTypes = [
      'image/jpeg', 
      'image/jpg', 
      'image/png', 
      'image/webp',
      'application/pdf'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return new Response(
        JSON.stringify({
          state: "failure",
          message: "Invalid file type. Only images (JPEG, PNG, WebP) and PDFs are allowed.",
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
          status: 400,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
        }
      );
    }

    // 1. Upload file to S3
    const fileKey = `receipts/${user.id}/${uuidv4()}-${file.name}`;
    const fileBuffer = await file.arrayBuffer();
    
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

    // Generate S3 URL
    const s3Url = `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

    // 2. Extract receipt data using OpenAI
    let extractedData: ReceiptDataExtract;
    try {
      extractedData = await extractImageData(s3Url);
    } catch (error) {
      console.error("OpenAI extraction failed:", error);
      
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

      return new Response(
        JSON.stringify({
          state: "success",
          message: "Receipt uploaded but extraction failed. Receipt created with minimal data.",
          data: {
            receipt,
            extraction_failed: true,
            s3_url: s3Url,
          },
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
        }
      );
    }

    // 3. Parse and validate extracted data
    const purchaseDate = extractedData.purchase_date 
      ? new Date(extractedData.purchase_date)
      : new Date();

    const subTotal = parseFloat(extractedData.sub_total) || 0;
    const taxAmount = parseFloat(extractedData.tax_total) || 0;
    const totalAmount = parseFloat(extractedData.total) || parseFloat(extractedData.totalAmount) || 0;

    // 4. Create receipt in database WITH S3 URL
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
        category_id: category_id || null,
        notes: `Extracted items: ${extractedData.items?.length || 0} items`,
      },
      include: {
        category: true,
      },
    });

    // 5. Return success response
    return new Response(
      JSON.stringify({
        state: "success",
        message: "Receipt uploaded and analyzed successfully",
        data: {
          receipt,
          extracted_data: extractedData,
          s3_url: s3Url,
        },
      }),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      }
    );

  } catch (error) {
    console.error("Error processing receipt upload:", error);
    
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