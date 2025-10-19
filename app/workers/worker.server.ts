

import { Job, Worker } from 'bullmq';
import { redisClient } from '~/redis.server';

const extractReceiptData = async (job: any) => {
  // Logic to extract data from receipt
  console.log(`Extracting data for job ${job.id}`);
  console.log('Job data:', job.data);
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { status: 'success', data: {/* extracted data */} };
}

const worker = new Worker('receipts', async (job: Job) => {
  const result = await extractReceiptData(job);
  return result;
}, {
    connection: redisClient,
    concurrency: 5,
});

worker.on('completed', job => {
  console.log(`✅ Job ${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
  console.log(`❌ Job ${job?.id} has failed with ${err.message}`);
});

worker.on('error', (err) => {
  console.log(`🚨 Worker error: ${err.message}`);
});

worker.on('ready', () => {
  console.log('🚀 Worker is ready and waiting for jobs...');
});

worker.on('stalled', (jobId) => {
  console.log(`⚠️ Job ${jobId} has stalled`);
});

// Graceful shutdown handling
const gracefulShutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  
  try {
    await worker.close();
    await redisClient.disconnect();
    console.log('✅ Worker and Redis connection closed gracefully');
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
