import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import sharp from 'sharp'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

// New way to configure the route
export const runtime = 'nodejs' // 'edge' or 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit" },
        { status: 400 }
      )
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type" },
        { status: 400 }
      )
    }

    // Ensure upload directory exists
    try {
      await mkdir(UPLOAD_DIR, { recursive: true })
    } catch (error) {
      console.error('Error creating upload directory:', error)
    }

    // Generate unique filename
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Process image with sharp
    const processedImage = await sharp(buffer)
      .resize(800, 800, { // Resize to max dimensions while maintaining aspect ratio
        fit: 'inside',
        withoutEnlargement: true
      })
      .toBuffer()

    // Generate filename with original extension
    const originalExtension = path.extname(file.name)
    const filename = `${uuidv4()}${originalExtension}`
    const filepath = path.join(UPLOAD_DIR, filename)

    // Save processed image
    await writeFile(filepath, processedImage)

    // Return the public URL
    const fileUrl = `/uploads/${filename}`
    return NextResponse.json({ fileUrl })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: "Failed to process upload" },
      { status: 500 }
    )
  }
}