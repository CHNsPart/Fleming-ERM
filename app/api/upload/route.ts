// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
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

    // Create unique filename
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${uuidv4()}.${file.name.split('.').pop()}`;
    
    // Define upload directory path
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(uploadDir, filename);
    
    // Save the file
    await writeFile(filePath, buffer);
    
    // Return the public URL
    const fileUrl = `/uploads/${filename}`;
    return NextResponse.json({ fileUrl });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: "Failed to process upload" }, { status: 500 });
  }
}