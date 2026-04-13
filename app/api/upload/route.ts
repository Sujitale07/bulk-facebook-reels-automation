import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = join(process.cwd(), 'uploads');
    // Ensure dir exists
    await mkdir(uploadsDir, { recursive: true });

    const filename = `${Date.now()}-${file.name.replaceAll(' ', '_')}`;
    const path = join(uploadsDir, filename);

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

    return NextResponse.json({ success: true, videoId: video.id });
  } catch (error: any) {
    console.error('Upload API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
