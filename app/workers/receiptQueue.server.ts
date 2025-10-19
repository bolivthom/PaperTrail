import { Queue, QueueEvents } from "bullmq";
import { redisClient } from "~/redis.server";

// Create a new connection in every instance
export const receiptQueue = new Queue('receipts', {
  connection: redisClient,
});

receiptQueue.on('error', (err) => {
  console.error('❌ Queue Error:', err);
});

const queueEvents = new QueueEvents("receipts", {
    connection: redisClient,
});

queueEvents.on("completed", ({ jobId, returnvalue }) => {
  console.log(`✅ Job ${jobId} completed with result:`, returnvalue);
});

queueEvents.on("failed", ({ jobId, failedReason }) => {
  console.log(`❌ Job ${jobId} failed:`, failedReason);
});

queueEvents.on('stalled', ({ jobId }) => {
  console.warn(`⚠️ Job ${jobId} stalled`);
});

queueEvents.on("progress", ({ jobId, data }) => {
  console.log(`📊 Job ${jobId} progress:`, data);
});

queueEvents.on('waiting', ({ jobId }) => {
  console.log(`⏳ Job ${jobId} is waiting to be processed`);
});

queueEvents.on('active', ({ jobId }) => {
  console.log(`🔧 Job ${jobId} is now active and being processed`);
});

console.log('🚀 Receipt queue events listener initialized');