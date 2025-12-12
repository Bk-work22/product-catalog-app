import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary (will be checked in the POST handler)
const configureCloudinary = () => {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;

  if (!cloud_name || !api_key || !api_secret) {
    throw new Error('Please define CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables. For local development, add them to .env.local. For production (Vercel), add them in your environment variables settings.');
  }

  cloudinary.config({
    cloud_name,
    api_key,
    api_secret,
  });
};

export async function POST(request: NextRequest) {
  try {
    // Configure Cloudinary before use
    configureCloudinary();

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert File to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convert buffer to base64
    const base64 = buffer.toString('base64');
    const dataURI = `data:${file.type};base64,${base64}`;

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        dataURI,
        {
          folder: 'products',
          resource_type: 'auto',
        },
        (error: any, result: any) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });

    return NextResponse.json(
      { 
        success: true, 
        data: { 
          url: (uploadResult as any).secure_url,
          public_id: (uploadResult as any).public_id 
        } 
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload image' },
      { status: 500 }
    );
  }
}

