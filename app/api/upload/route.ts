// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 2MB limit" }, { status: 400 });
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    // Get binary data from file
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Create a unique filename
    const filename = `${uuidv4()}.${file.name.split('.').pop()}`;
    
    // Store the image in the database
    const uploadedImage = await prisma.uploadedImage.create({
      data: {
        filename: filename,
        data: buffer,
        mimeType: file.type
      }
    });
    
    // Return a URL that will access the image via our API
    const fileUrl = `/api/images/${uploadedImage.id}`;
    
    return NextResponse.json({ fileUrl });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: "Failed to process upload" }, { status: 500 });
  }
}