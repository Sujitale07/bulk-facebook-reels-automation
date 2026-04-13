"use server"
import { prisma } from '@/lib/prisma';
import { createSchedule as createScheduleLogic } from '@/lib/scheduler-logic';
import { revalidatePath } from 'next/cache';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { getAuthenticatedUser } from '@/lib/auth-utils';

export async function uploadVideo(formData: FormData) {
  const file = formData.get('file') as File;

  if (!file) {
    return { error: 'Missing file' };
  }

  try {
    const user = await getAuthenticatedUser();
    if (!user) return { error: 'Unauthorized' };
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary instead of local filesystem
    const { url } = await uploadToCloudinary(buffer, file.name);

    const video = await prisma.video.create({
      data: {
        filename: file.name,
        path: url, // Store the Cloudinary URL in the path field
        size: file.size,
        userId: user.id,
        status: 'uploaded'
      }
    });

    revalidatePath('/upload');
    return { success: true, videoId: video.id };
  } catch (err: any) {
    console.error('Cloudinary Upload Error:', err);
    return { error: `UPLOAD_FAILURE: ${err.message}` };
  }
}

export async function submitSchedule(data: {
  videoIds: string[];
  videosPerDay: number;
  startDate: string;
  timeSlots: string[];
}) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return { error: 'Unauthorized' };

    const result = await createScheduleLogic({
      userId: user.id,
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
