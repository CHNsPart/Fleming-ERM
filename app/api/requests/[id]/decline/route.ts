import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { initDatabase } from '@/app/api/_init';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  
  try {
    await initDatabase();
    const id = params.id;
    const updatedRequest = await prisma.request.update({
      where: { id },
      data: { status: 'DECLINED' },
    });
    
      return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Request failed' }, { status: 500 });
  }
}