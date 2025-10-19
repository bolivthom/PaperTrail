import { Job, Worker } from 'bullmq';
import { redisClient } from '~/redis.server';
import { extractImageData } from '~/openai.server';
import { ReceiptExtractionError } from '~/errors';
import prisma from '~/prisma.server';

// Helper function to handle category creation/lookup
async function getOrCreateCategory(extractedCategory: string | undefined, userId: string, existingCategoryId: string | null): Promise<string | null> {
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
      user_id: userId,
      name: {
        equals: normalizedCategory,
        mode: "insensitive",
      },
    },
  });

  if (existingCategory) {
    console.log(`📂 Using existing category: ${normalizedCategory}`);
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
      user_id: userId,
      name: finalCategoryName,
      description: `Automatically created from receipt analysis`,
    },
  });

  console.log(`📂 Created new category: ${finalCategoryName}`);
  return newCategory.id;
}

// Process receipt extraction job - FIXED FUNCTION NAME
const processReceiptJob = async (job: Job) => {
  console.log(`🔍 Starting OpenAI extraction for job ${job.id}`);
  console.log('📋 Job data:', job.data);
  
  const { receiptId, presignedUrl, userId, categoryId, fileName, fileType, s3Url } = job.data;

  try {
    // Update receipt status to processing
    await prisma.receipt.update({
      where: { id: receiptId },
      data: { status: 'processing' }
    });
    await job.updateProgress(10);
    console.log(`🔄 Updated receipt ${receiptId} status to processing`);

    // Extract receipt data using OpenAI - THIS IS THE KEY PART!
    console.log(`🤖 Calling OpenAI extraction for receipt ${receiptId}`);
    let extractedData;
    try {
      extractedData = await extractImageData(presignedUrl);
      console.log(`✅ OpenAI extraction successful for job ${job.id}`, {
        merchant: extractedData.merchant_name,
        total: extractedData.total,
        itemsCount: extractedData.items?.length || 0
      });
    } catch (error) {
      console.error(`❌ OpenAI extraction failed for job ${job.id}:`, error);

      if (error instanceof ReceiptExtractionError) {
        // Update receipt with extraction failure
        await prisma.receipt.update({
          where: { id: receiptId },
          data: { 
            status: 'failed',
            notes: `Extraction failed: Missing receipt or blurry image`,
            company_name: "Extraction Failed - Blurry/Missing"
          }
        });
        throw new Error("Missing receipt or blurry image.");
      }

      // For other errors, mark as failed but keep the minimal data
      await prisma.receipt.update({
        where: { id: receiptId },
        data: { 
          status: 'failed',
          notes: `Extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          company_name: "Extraction Failed"
        }
      });
      throw error;
    }

    await job.updateProgress(60);
    console.log(`✅ OpenAI extraction completed for job ${job.id}`);

    // Handle category
    const finalCategoryId = await getOrCreateCategory(extractedData.category, userId, categoryId);
    await job.updateProgress(70);

    // Parse and validate extracted data
    const purchaseDate = extractedData.purchase_date
      ? new Date(extractedData.purchase_date)
      : new Date();

    const subTotal = parseFloat(extractedData.sub_total) || 0;
    const taxAmount = parseFloat(extractedData.tax_total) || 0;
    const totalAmount =
      parseFloat(extractedData.total) ||
      parseFloat(extractedData.totalAmount) ||
      0;

    console.log(`📊 Parsed receipt data for job ${job.id}:`, {
      merchant: extractedData.merchant_name,
      total: totalAmount,
      date: purchaseDate,
      category: extractedData.category
    });

    await job.updateProgress(80);

    // Update receipt with extracted data
    const receipt = await prisma.receipt.update({
      where: { id: receiptId },
      data: {
        company_name: extractedData.merchant_name || "Unknown Merchant",
        company_address: extractedData.merchant_address || null,
        purchase_date: purchaseDate,
        sub_total: subTotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        currency: extractedData.currency || "JMD",
        items_json: extractedData.items || [],
        category_id: finalCategoryId,
        notes: `Extracted items: ${extractedData.items?.length || 0} items`,
        status: 'completed',
      },
      include: {
        category: true,
      },
    });

    await job.updateProgress(100);

    console.log(`✅ Receipt ${receiptId} fully processed and updated in database`);

    return {
      status: 'success',
      receiptId: receipt.id,
      message: 'Receipt processed successfully with OpenAI extraction',
      data: {
        merchant: receipt.company_name,
        total: receipt.total_amount,
        itemsCount: extractedData.items?.length || 0
      }
    };
  } catch (error) {
    console.error(`💥 Error processing receipt ${receiptId}:`, error);

    // Update receipt status to failed
    await prisma.receipt.update({
      where: { id: receiptId },
      data: { 
        status: 'failed',
        notes: `Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    });

    throw error; // Re-throw to mark job as failed
  }
}

// FIXED: Use the correct function name in Worker constructor
const worker = new Worker('receipts', processReceiptJob, {
  connection: redisClient,
  concurrency: 3, // Process 3 receipts concurrently
  limiter: {
    max: 10, // Maximum number of jobs processed per duration
    duration: 1000, // Per 1 second
  },
});

worker.on('completed', (job, result) => {
  console.log(`✅ Job ${job.id} has completed! Result:`, result);
});

worker.on('failed', (job, err) => {
  console.log(`❌ Job ${job?.id} has failed with:`, err.message);
});

worker.on('error', (err) => {
  console.log(`🚨 Worker error:`, err);
});

worker.on('ready', () => {
  console.log('🚀 Receipt worker is ready and waiting for jobs...');
});

worker.on('stalled', (jobId) => {
  console.log(`⚠️ Job ${jobId} has stalled`);
});

worker.on('progress', (job, progress) => {
  console.log(`📊 Job ${job.id} progress: ${progress}%`);
});

worker.on('active', (job) => {
  console.log(`🔧 Job ${job.id} is now active and being processed`);
});

// Graceful shutdown handling
const gracefulShutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  
  try {
    await worker.close();
    console.log('✅ Worker closed gracefully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle process termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

export { worker };