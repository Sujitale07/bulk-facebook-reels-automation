import { addDays, addHours, setHours, setMinutes, startOfDay } from 'date-fns';
import { prisma } from './prisma';
import { getPostQueue } from './queue';

export interface ScheduleConfig {
  userId: string;
  videoIds: string[];
  videosPerDay: number;
  repeatDays?: number;
  startDate: Date;
  timeSlots: string[]; // e.g. ["09:00", "15:00", "21:00"]
}

export async function createSchedule(config: ScheduleConfig) {
  const { userId, videoIds, videosPerDay, repeatDays, startDate, timeSlots } = config;

  // 1. Create Schedule record
  const schedule = await prisma.schedule.create({
    data: {
      name: `Schedule ${new Date().toLocaleDateString()}`,
      videosPerDay,
      repeatDays,
      startDate,
      userId,
    }
  });

  const postJobsData = [];
  let videoIndex = 0;
  let currentDay = 0;

  // 2. Distribute videos across days and time slots
  while (videoIndex < videoIds.length) {
    for (let slot = 0; slot < videosPerDay && videoIndex < videoIds.length; slot++) {
      const timeSlot = timeSlots[slot % timeSlots.length] || "12:00";
      const [hours, minutes] = timeSlot.split(':').map(Number);
      
      const scheduledAt = setMinutes(
        setHours(addDays(startDate, currentDay), hours), 
        minutes
      );

      postJobsData.push({
        scheduledAt,
        videoId: videoIds[videoIndex],
        scheduleId: schedule.id,
        status: 'pending'
      });

      videoIndex++;
    }
    currentDay++;
  }

  // 3. Batch create PostJobs
  const createdJobs = await prisma.postJob.createMany({
    data: postJobsData
  });

  // 4. (Optional) If repeatDays is set, we could cycle or recreate jobs. 
  // For now, we'll just fulfill the initial batch.

  // 5. Enqueue jobs into BullMQ
  const queue = getPostQueue();
  const jobsToEnqueue = await prisma.postJob.findMany({
    where: { scheduleId: schedule.id }
  });

  for (const job of jobsToEnqueue) {
    const delay = job.scheduledAt.getTime() - Date.now();
    await queue.add(
      'post-reel', 
      { postJobId: job.id }, 
      { delay: Math.max(0, delay) }
    );
  }

  return { schedule, jobCount: jobsToEnqueue.length };
}
