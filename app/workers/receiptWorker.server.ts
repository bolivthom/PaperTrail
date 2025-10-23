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
      user_id: userId,
      name: finalCategoryName,
      description: `Automatically created from receipt analysis`,
    },
  });

  console.log(`ðŸ“‚ Created new category: ${finalCategoryName}`);
  return newCategory.id;
}

// Process receipt extraction job - FIXED FUNCTION NAME
// const processReceiptJob = async (job: Job) => {
//   console.log(`ðŸ” Starting OpenAI extraction for job ${job.id}`);
//   console.log('ðŸ“‹ Job data:', job.data);

//   const { receiptId, presignedUrl, userId, categoryId, fileName, fileType, s3Url } = job.data;

//   try {
//     // Update receipt status to processing
//     await prisma.receipt.update({
//       where: { id: receiptId },
//       data: { status: 'processing' }
//     });
//     await job.updateProgress(10);
//     console.log(`Updated receipt ${receiptId} status to processing`);

//     // Extract receipt data using OpenAI - THIS IS THE KEY PART!
//     console.log(`Calling OpenAI extraction for receipt ${receiptId}`);
//     let extractedData;
//     try {
//       extractedData = await extractImageData(presignedUrl);
//       console.log(`OpenAI extraction successful for job ${job.id}`, {
//         merchant: extractedData.merchant_name,
//         total: extractedData.total,
//         itemsCount: extractedData.items?.length || 0
//       });

//       // ADD CURRENCY VALIDATION
//       if (extractedData.currency && extractedData.currency.toUpperCase() !== 'JMD') {
//         const errorMessage = `Currency Not Supported: This receipt is in ${extractedData.currency}. We currently only support JMD receipts. Multi-currency support is coming soon!`;

//         // Update receipt with clear error status
//         await prisma.receipt.update({
//           where: { id: receiptId },
//           data: {
//             status: 'failed',
//             notes: errorMessage,
//             company_name: `Rejected - ${extractedData.currency} Currency Not Supported`
//           }
//         });

//         throw new Error(errorMessage);
//       }

//     } catch (error) {
//       console.error(`âŒ OpenAI extraction failed for job ${job.id}:`, error);

//       if (error instanceof ReceiptExtractionError) {
//         // Update receipt with extraction failure
//         await prisma.receipt.update({
//           where: { id: receiptId },
//           data: {
//             status: 'failed',
//             notes: `Extraction failed: Missing receipt or blurry image`,
//             company_name: "Extraction Failed - Blurry/Missing"
//           }
//         });
//         throw new Error("Missing receipt or blurry image.");
//       }

//       // For other errors, mark as failed but keep the minimal data
//       await prisma.receipt.update({
//         where: { id: receiptId },
//         data: {
//           status: 'failed',
//           notes: `Extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
//           company_name: "Extraction Failed"
//         }
//       });
//       throw error;
//     }

const processReceiptJob = async (job: Job) => {
  console.log(`🔄 Starting OpenAI extraction for job ${job.id}`);
  console.log('📋 Job data:', job.data);

  const { receiptId, presignedUrl, userId, categoryId, fileName, fileType, s3Url } = job.data;

  try {
    // Update receipt status to processing
    await prisma.receipt.update({
      where: { id: receiptId },
      data: { status: 'processing' }
    });
    await job.updateProgress(10);
    console.log(`🔧 Updated receipt ${receiptId} status to processing`);

    // Extract receipt data using OpenAI
    console.log(`🤖 Calling OpenAI extraction for receipt ${receiptId}`);
    let extractedData;
    try {
      extractedData = await extractImageData(presignedUrl);
      console.log(`✅ OpenAI extraction successful for job ${job.id}`, {
        merchant: extractedData.merchant_name,
        total: extractedData.total,
        itemsCount: extractedData.items?.length || 0,
        currency: extractedData.currency
      });

      // ADD CURRENCY VALIDATION HERE - RIGHT AFTER EXTRACTION
      if (extractedData.currency && extractedData.currency.toUpperCase() !== 'JMD') {
        const errorMessage = `Currency Not Supported: This receipt is in ${extractedData.currency}. We currently only support JMD receipts. Multi-currency support is coming soon!`;

        // Update receipt with clear error status
        await prisma.receipt.update({
          where: { id: receiptId },
          data: {
            status: 'failed',
            notes: errorMessage,
            company_name: `Rejected - ${extractedData.currency} Not Supported`
          }
        });

        throw new Error(errorMessage);
      }

    } catch (error) {
      console.error(`❌ OpenAI extraction failed for job ${job.id}:`, error);

      // Handle currency error
      if (error instanceof Error && error.message.includes("Currency Not Supported")) {
        throw error; // Already updated the receipt above, just throw
      }

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

    await job.updateProgress(60);
    console.log(`âœ… OpenAI extraction completed for job ${job.id}`);

    // Handle category
    const finalCategoryId = await getOrCreateCategory(extractedData.category, userId, categoryId);
    await job.updateProgress(70);

    // Parse and validate extracted data
    let purchaseDate: Date;
    if (extractedData.purchase_date) {
      const parsedDate = new Date(extractedData.purchase_date);
      // Check if date is valid
      if (isNaN(parsedDate.getTime())) {
        console.warn(`Invalid date string received: "${extractedData.purchase_date}". Using current date.`);
        purchaseDate = new Date();
      } else {
        purchaseDate = parsedDate;
      }
    } else {
      purchaseDate = new Date();
    }

    // Helper function to parse currency strings
    const parseCurrencyString = (value: string | undefined): number => {
      if (!value) return 0;
      // Remove currency symbols, letters, and commas, then parse
      const cleaned = value.replace(/[A-Z\s,]/gi, '').trim();
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    };

    const subTotal = parseCurrencyString(extractedData.sub_total);
    const taxAmount = parseCurrencyString(extractedData.tax_total);
    const totalAmount =
      parseCurrencyString(extractedData.total) ||
      parseCurrencyString(extractedData.totalAmount) ||
      0;

    console.log(`ðŸ“Š Parsed receipt data for job ${job.id}:`, {
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

    console.log(`âœ… Receipt ${receiptId} fully processed and updated in database`);

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
    console.error(`ðŸ’¥ Error processing receipt ${receiptId}:`, error);

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
  console.log(`âœ… Job ${job.id} has completed! Result:`, result);
});

worker.on('failed', (job, err) => {
  console.log(`âŒ Job ${job?.id} has failed with:`, err.message);
});

worker.on('error', (err) => {
  console.log(`ðŸš¨ Worker error:`, err);
});

worker.on('ready', () => {
  console.log('ðŸš€ Receipt worker is ready and waiting for jobs...');
});

worker.on('stalled', (jobId) => {
  console.log(`âš ï¸ Job ${jobId} has stalled`);
});

worker.on('progress', (job, progress) => {
  console.log(`ðŸ“Š Job ${job.id} progress: ${progress}%`);
});

worker.on('active', (job) => {
  console.log(`ðŸ”§ Job ${job.id} is now active and being processed`);
});

// Graceful shutdown handling
const gracefulShutdown = async (signal: string) => {
  console.log(`\nðŸ›‘ Received ${signal}. Starting graceful shutdown...`);

  try {
    await worker.close();
    console.log('âœ… Worker closed gracefully');
    process.exit(0);
  } catch (error) {
    console.error('âŒ Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle process termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('ðŸš¨ Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('ðŸš¨ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

export { worker };