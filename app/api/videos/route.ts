import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { unlink } from 'fs/promises';
import { getAuthenticatedUser } from '@/lib/auth-utils';

export async function GET(req: Request) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const videos = await prisma.video.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
        postJobs: true
    }
  });

  return NextResponse.json(videos);
}

export async function DELETE(req: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const videoId = searchParams.get('videoId');

  if (!videoId) {
    return NextResponse.json({ error: 'Missing videoId' }, { status: 400 });
  }

  try {
    const video = await prisma.video.findUnique({
      where: { id: videoId, userId: user.id } // Ensure it belongs to the user
    });

    if (video) {
      // 1. Delete file from disk
      try {
        await unlink(video.path);
      } catch (e) {
        console.error('Failed to delete file from disk:', e);
      }

      // 2. Delete from DB (Cascade will handle postJobs if configured)
      await prisma.video.delete({
        where: { id: videoId }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
