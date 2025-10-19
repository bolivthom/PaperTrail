
// import { Queue, QueueEvents } from "bullmq";
// import { redisClient } from "~/redis.server";

// // console.log('REDIS CLIENT IN QUEUE', redisClient);
// // Create a new connection in every instance
// export const receiptQueue = new Queue('receipts', {
//   connection: redisClient,


// });

// receiptQueue.on('error', (err) => {
//   console.error('Queue Error:', err);
// });


// const queueEvents = new QueueEvents("receipts", {
//     connection: redisClient,
// });

// queueEvents.on("completed", (jobId, result) => {
//   console.log(`Job ${jobId} completed ${result}`);
// });

// queueEvents.on("failed", (jobId, err) => {
//   console.log(`Job ${jobId} failed ${err.message}`);
// });

// queueEvents.on('stalled', ({ jobId }) => console.warn('stalled', jobId));

// queueEvents.on(
//   "progress",
//   ( e: { jobId: string; data: number }) => {
//     console.log(`Job ${e.jobId} progress: ${e.data}`);
//   }
// );

// // You could do for example, if its already in DB
// // await receiptQueue.add('receiptDataExtractor', { receiptId: 'some-id' });
// // Or for example, if you want to pass image URL directly and create the record
// // await receiptQueue.add('receiptDataExtractor', { image_url: 'some-id', user_id: 'user-id' });