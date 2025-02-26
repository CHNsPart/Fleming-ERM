// app/api/images/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Fetch the image from the database
    const image = await prisma.uploadedImage.findUnique({
      where: { id }
    });
    
    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }
    
    // Create a response with the correct content type
    const response = new NextResponse(image.data);
    
    // Set appropriate headers
    response.headers.set('Content-Type', image.mimeType);
    response.headers.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    
    return response;
  } catch (error) {
    console.error('Error retrieving image:', error);
    return NextResponse.json({ error: "Failed to retrieve image" }, { status: 500 });
  }
}