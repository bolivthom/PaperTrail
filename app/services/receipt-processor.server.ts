import { extractImageData, type ReceiptDataExtract } from "~/openai.server";
import { ReceiptExtractionError } from "~/errors";
import prisma from "~/prisma.server";
import { uploadToS3, generatePresignedUrl } from "~/s3.server";
import { v4 as uuidv4 } from "uuid";

interface ProcessReceiptResult {
    state: "success" | "failure";
    status: number;
    extractedData?: ReceiptDataExtract;
    message?: string;
}

export class ReceiptProcessor {
  static async processReceiptUpload(
    file: File,
    user: { id: string },
    manualCategoryId: string | null = null
  ): Promise<ProcessReceiptResult> {
    try {
      // Validate file
      const validationResult = this.validateFile(file);
      if (validationResult) return validationResult;

      // Upload to S3 and get URLs
      const uploadResult = await this.uploadFileToS3(file, user.id);
      if (!uploadResult) {
        return {
          state: "failure",
          message: "Failed to upload file to S3",
          status: 500,
        };
      }

      const { s3Url, presignedUrl } = uploadResult;

      // Extract data with OpenAI
      const extractionResult = await this.extractReceiptData(presignedUrl);
      if (extractionResult.state === "failure") return extractionResult;

      const extractedData = extractionResult.extractedData!;

      // Handle category
      const categoryId = await this.handleCategory(extractedData.category, user.id);

      // Create receipt in database
      const receipt = await this.createReceiptRecord({
        user,
        file,
        extractedData,
        s3Url,
        categoryId,
        manualCategoryId,
      });

      return {
        state: "success",
        message: "Receipt uploaded and analyzed successfully",
        data: receipt,
        status: 201,
      };

    } catch (error) {
      console.error("Error processing receipt upload:", error);
      
      // If we have the file and user, try to create a minimal receipt
      if (file && user) {
        try {
          const uploadResult = await this.uploadFileToS3(file, user.id);
          if (uploadResult) {
            return await this.handleExtractionFailure(file, user, uploadResult.s3Url, manualCategoryId);
          }
        } catch (fallbackError) {
          console.error("Fallback also failed:", fallbackError);
        }
      }
      
      return {
        state: "failure",
        message: "Internal server error",
        status: 500,
      };
    }
  }

  private static validateFile(file: File): ProcessReceiptResult | null {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      return {
        state: "failure",
        message: "Invalid file type. Only images (JPEG, PNG, WebP) and PDFs are allowed.",
        status: 422,
      };
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        state: "failure",
        message: "File too large. Maximum size is 10MB.",
        status: 422,
      };
    }

    return null;
  }

  private static async uploadFileToS3(file: File, userId: string): Promise<{ s3Url: string; presignedUrl: string } | null> {
    try {
      const fileKey = `receipts/${userId}/${uuidv4()}-${file.name}`;
      
      await uploadToS3({
        key: fileKey,
        body: Buffer.from(await file.arrayBuffer()),
        contentType: file.type,
        metadata: { userId, originalName: file.name },
      });

      const presignedUrl = await generatePresignedUrl(fileKey);
      const s3Url = process.env.S3_PUBLIC_BASE
        ? `${process.env.S3_PUBLIC_BASE}/${fileKey}`
        : `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${fileKey}`;

      console.log("File uploaded to S3:", s3Url);
      return { s3Url, presignedUrl };

    } catch (error) {
      console.error("Failed to upload to S3:", error);
      return null;
    }
  }

  private static async extractReceiptData(presignedUrl: string): Promise<{
    state: "success" | "failure";
    extractedData?: ReceiptDataExtract;
    message?: string;
  }> {
    try {
      const extractedData = await extractImageData(presignedUrl);
      console.log("OpenAI extraction successful");
      return { state: "success", extractedData };

    } catch (error) {
      console.error("OpenAI extraction failed:", error);

      if (error instanceof ReceiptExtractionError) {
        return {
          state: "failure",
          message: "Missing receipt or blurry image.",
        };
      }

      // Re-throw other errors to be handled by the main catch block
      throw error;
    }
  }

  private static async handleCategory(category: string | undefined, userId: string): Promise<string | null> {
    if (!category) return null;

    const normalizedCategory = category.trim();
    const validCategories = [
      "Retail", "Dining", "Travel", "Services", "Financial",
      "Entertainment", "Utilities", "Returns", "Business",
      "Government", "Other",
    ];

    // Check if category exists
    const existingCategory = await prisma.category.findFirst({
      where: {
        user_id: userId,
        name: { equals: normalizedCategory, mode: "insensitive" },
      },
    });

    if (existingCategory) {
      console.log(`Using existing category: ${normalizedCategory}`);
      return existingCategory.id;
    }

    // Create new category
    const isValidCategory = validCategories.includes(normalizedCategory);
    const finalCategoryName = isValidCategory ? normalizedCategory : "Other";

    const newCategory = await prisma.category.create({
      data: {
        user_id: userId,
        name: finalCategoryName,
        description: `Automatically created from receipt analysis`,
      },
    });

    console.log(`Created new category: ${finalCategoryName}`);
    return newCategory.id;
  }

  private static async createReceiptRecord(params: {
    user: { id: string };
    file: File;
    extractedData: ReceiptDataExtract;
    s3Url: string;
    categoryId: string | null;
    manualCategoryId: string | null;
  }) {
    const { user, file, extractedData, s3Url, categoryId, manualCategoryId } = params;

    const purchaseDate = extractedData.purchase_date
      ? new Date(extractedData.purchase_date)
      : new Date();

    const subTotal = parseFloat(extractedData.sub_total) || 0;
    const taxAmount = parseFloat(extractedData.tax_total) || 0;
    const totalAmount = parseFloat(extractedData.total) || parseFloat(extractedData.totalAmount) || 0;

    return await prisma.receipt.create({
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
        category_id: manualCategoryId || categoryId, // Manual override takes precedence
        notes: `Extracted items: ${extractedData.items?.length || 0} items`,
      },
      include: {
        category: true,
      },
    });
  }

  static async handleExtractionFailure(file: File, user: { id: string }, s3Url: string, manualCategoryId: string | null): Promise<ProcessReceiptResult> {
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
        category_id: manualCategoryId || null,
      },
    });

    return {
      state: "success",
      message: "Unable to parse; Receipt uploaded to S3 and was saved with minimal data",
      data: receipt,
      status: 200,
    };
  }
}