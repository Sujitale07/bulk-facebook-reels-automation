import { Worker, Job } from 'bullmq';
import { connection, POST_QUEUE_NAME } from '../lib/queue';
import { prisma } from '@/lib/prisma';
import { FacebookReelsService } from '../lib/facebook';
import axios from 'axios';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

export function setupPostWorker() {
  const worker = new Worker(
    POST_QUEUE_NAME,
    async (job: Job) => {
      const { postJobId } = job.data;
      
      console.log(`[Worker] Processing post job: ${postJobId}`);

      // 1. Fetch job details
      const postJob = await prisma.postJob.findUnique({
        where: { id: postJobId },
        include: {
          video: true,
          schedule: {
            include: { user: true }
          }
        }
      });

      if (!postJob) {
        throw new Error(`PostJob ${postJobId} not found`);
      }

      const { video, schedule } = postJob;
      const { user } = schedule;

      if (!user.pageId || !user.pageAccessToken) {
        // Log error and mark job as failed
        await prisma.postJob.update({
          where: { id: postJobId },
          data: { 
            status: 'failed',
            log: 'Missing Facebook Page ID or Access Token'
          }
        });
        throw new Error('Missing Facebook credentials');
      }

      const tempPath = join(tmpdir(), `upload-${Date.now()}-${video.filename}`);

      try {
        // 2. Mark job as processing
        await prisma.postJob.update({
          where: { id: postJobId },
          data: { status: 'processing' }
        });

        // 3. Download from Cloudinary to temp path
        console.log(`[Worker] Fetching media from Cloudinary: ${video.path}`);
        const response = await axios.get(video.path, { responseType: 'arraybuffer' });
        await writeFile(tempPath, Buffer.from(response.data));

        const fbService = new FacebookReelsService(user.pageId, user.pageAccessToken);

        // 4. Step 1: Initialize
        console.log(`[Worker] Initializing upload for job ${postJobId}`);
        const { video_id: fbVideoId, upload_url: fbUploadUrl } = await fbService.initializeUpload();

        // 5. Step 2: Upload
        console.log(`[Worker] Uploading video for job ${postJobId}`);
        let lastProgress = 0;
        await fbService.uploadVideo(fbUploadUrl, tempPath, async (progress) => {
          // Only update DB every 10% to avoid overloading Prisma
          if (progress >= lastProgress + 10 || progress === 100) {
            lastProgress = progress;
            await prisma.postJob.update({
              where: { id: postJobId },
              data: { progress }
            });
          }
        });

        // Clean up temp file
        await unlink(tempPath);

        // 5. Step 3: Publish
        console.log(`[Worker] Publishing reel for job ${postJobId}`);
        const fbPostId = await fbService.publishReel(fbVideoId, '#shortreel');

        // 6. Update status to success
        await prisma.postJob.update({
          where: { id: postJobId },
          data: { 
            status: 'success',
            facebookPostId: fbPostId,
            log: 'Successfully posted to Facebook Reels'
          }
        });

        // Also update video status if needed
        await prisma.video.update({
          where: { id: video.id },
          data: { status: 'posted' }
        });

        console.log(`[Worker] Finished job ${postJobId} successfully`);
      } catch (error: any) {
        console.error(`[Worker] Job ${postJobId} failed:`, error);
        
        await prisma.postJob.update({
          where: { id: postJobId },
          data: { 
            status: 'failed',
            log: `Error: ${error.message || 'Unknown error'}`
          }
        });

        throw error; // Let BullMQ handle retries
      }
    },
    { 
      connection,
      concurrency: 2 // Allow processing 2 jobs at once
    }
  );

  worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed with ${err.message}`);
  });

  return worker;
}
