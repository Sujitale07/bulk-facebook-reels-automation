import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const cloudinaryConfig = cloudinary;

export async function uploadToCloudinary(fileBuffer: Buffer, filename: string): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'video',
        public_id: filename.split('.')[0],
        folder: 'automate_reels',
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('Cloudinary upload failed: No result'));
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
}
