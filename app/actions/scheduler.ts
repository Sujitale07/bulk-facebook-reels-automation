'use server';

import { writeFile } from 'fs/promises';
import { join } from 'path';
import { prisma } from '@/lib/prisma';
import { createSchedule as createScheduleLogic } from '@/lib/scheduler-logic';
import { revalidatePath } from 'next/cache';

export async function uploadVideo(formData: FormData) {
  const file = formData.get('file') as File;
  const userId = formData.get('userId') as string;

  if (!file || !userId) {
    return { error: 'Missing file or userId' };
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const filename = `${Date.now()}-${file.name}`;
  const path = join(process.cwd(), 'uploads', filename);

  await writeFile(path, buffer);

  const video = await prisma.video.create({
    data: {
      filename: file.name,
      path: path,
      size: file.size,
      userId: userId,
      status: 'uploaded'
    }
  });

  revalidatePath('/upload');
  return { success: true, videoId: video.id };
}

export async function submitSchedule(data: {
  userId: string;
  videoIds: string[];
  videosPerDay: number;
  startDate: string;
  timeSlots: string[];
}) {
  try {
    const result = await createScheduleLogic({
      userId: data.userId,
      videoIds: data.videoIds,
      videosPerDay: data.videosPerDay,
      startDate: new Date(data.startDate),
      timeSlots: data.timeSlots
    });

    revalidatePath('/dashboard');
    return { success: true, scheduleId: result.schedule.id };
  } catch (error: any) {
    return { error: error.message };
  }
}
