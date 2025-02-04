import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function POST(_: NextRequest, { params }: { params: { id: string } }) {
  const { isAuthenticated, getUser } = getKindeServerSession();
  
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await getUser();
  if (user?.email !== 'projectapplied02@gmail.com') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  try {
    const id = params.id;
    
    // First verify the request exists and is in a valid state
    const existingRequest = await prisma.request.findUnique({
      where: { id }
    });

    if (!existingRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    if (existingRequest.status !== 'PENDING') {
      return NextResponse.json({ 
        error: 'Only pending requests can be declined' 
      }, { status: 400 });
    }

    const updatedRequest = await prisma.request.update({
      where: { id },
      data: { status: 'DECLINED' },
    });
    
    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error('Error declining request:', error);
    return NextResponse.json({ 
      error: 'Failed to decline request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}