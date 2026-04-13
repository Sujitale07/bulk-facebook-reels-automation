import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth-utils';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const { url } = await uploadToCloudinary(buffer, file.name);

    const video = await prisma.video.create({
      data: {
        filename: file.name,
        path: url,
        size: file.size,
        userId: user.id,
        status: 'uploaded'
      }
    });

    return NextResponse.json({ success: true, videoId: video.id });
  } catch (error: any) {
    console.error('Upload API Error:', error);
    return NextResponse.json({ error: `UPLOAD_FAILURE: ${error.message}` }, { status: 500 });
  }
}
