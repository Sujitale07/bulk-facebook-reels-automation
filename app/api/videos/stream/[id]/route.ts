import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createReadStream, statSync } from 'fs';
import { auth } from '@clerk/nextjs/server';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return new NextResponse("Unauthorized", { status: 401 });

    // Find internal user id
    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) return new NextResponse("User not found", { status: 404 });

    const { id } = await params;
    
    const video = await prisma.video.findUnique({
      where: { id: id, userId: user.id } 
    });

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    const path = video.path;

    // Handle Cloudinary URLs (starting with http)
    if (path.startsWith('http')) {
      return NextResponse.redirect(path, { status: 307 });
    }

    // Fallback for local filesystem (local development)
    const stats = statSync(path);
    const range = req.headers.get('range');

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
      const chunksize = (end - start) + 1;
      const file = createReadStream(path, { start, end });
      
      return new NextResponse(file as any, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${stats.size}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize.toString(),
          'Content-Type': 'video/mp4',
        }
      });
    } else {
      const file = createReadStream(path);
      return new NextResponse(file as any, {
        headers: {
          'Content-Length': stats.size.toString(),
          'Content-Type': 'video/mp4',
        }
      });
    }
  } catch (error) {
    console.error('Streaming error:', error);
    return NextResponse.json({ error: 'Failed to stream video' }, { status: 500 });
  }
}
