import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const filename = uuidv4() + path.extname(file.name);
  const filePath = path.join(process.cwd(), 'public/uploads', filename);

  try {
    await writeFile(filePath, buffer);
    return NextResponse.json({ fileUrl: `/uploads/${filename}` });
  } catch (error) {
    console.error('Error saving file:', error);
    return NextResponse.json({ error: "Error uploading file" }, { status: 500 });
  }
}