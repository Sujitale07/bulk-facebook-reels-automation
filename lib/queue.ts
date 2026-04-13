import { Queue, Worker, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export const connection = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null,
});

connection.on('error', (err) => {
  console.error('❌ Redis Connection Error:', err.message);
});

connection.on('connect', () => {
  console.log('✅ Connected to Redis');
});

export const POST_QUEUE_NAME = 'video-reels-posting';

// Create queue singleton
let postQueue: Queue | undefined;

export function getPostQueue() {
  if (!postQueue) {
    postQueue = new Queue(POST_QUEUE_NAME, {
      connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000 * 60 * 5, // 5 minutes
        },
        removeOnComplete: true,
      },
    });
  }
  return postQueue;
}
