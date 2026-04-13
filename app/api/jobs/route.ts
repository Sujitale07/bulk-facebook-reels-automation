import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const jobs = await prisma.postJob.findMany({
    where: {
      schedule: {
        userId: userId
      }
    },
    include: {
      video: true,
      schedule: true
    },
    orderBy: {
      scheduledAt: 'desc'
    },
    take: 20
  });

  return NextResponse.json(jobs);
}

export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get('jobId');

  if (!jobId) {
    return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });
  }

  try {
    const job = await prisma.postJob.findFirst({
      where: { 
        id: jobId,
        schedule: { userId }
      }
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found or access denied' }, { status: 404 });
    }

    await prisma.postJob.delete({
      where: { id: jobId }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
