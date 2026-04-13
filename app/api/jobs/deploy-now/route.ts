import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPostQueue } from '@/lib/queue';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { jobId } = await req.json();

    if (!jobId) {
      return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });
    }

    const job = await prisma.postJob.findUnique({
      where: { id: jobId },
      include: { schedule: true }
    });

    if (!job || job.schedule.userId !== userId) {
      return NextResponse.json({ error: 'Job not found or unauthorized' }, { status: 404 });
    }

    // Update scheduledAt to now and reset status
    const updatedJob = await prisma.postJob.update({
      where: { id: jobId },
      data: {
        status: 'pending',
        scheduledAt: new Date(),
        log: null
      }
    });

    // Re-add to queue with 0 delay (Force execution)
    const queue = getPostQueue();
    await queue.add(
        'video-reels-posting', 
        { postJobId: job.id }, 
        { delay: 0, priority: 1 } // High priority, 0 delay
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
