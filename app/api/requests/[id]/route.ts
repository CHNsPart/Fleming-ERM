import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { isAuthenticated } = getKindeServerSession();
  
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = params.id;

  try {
    const requestData = await prisma.request.findUnique({
      where: { id },
      include: {
        user: {
          select: { name: true, email: true }
        },
        equipment: true
      },
    });

    if (!requestData) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const remainingQuantity = requestData.quantity - requestData.returnedQuantity;


    return NextResponse.json({
      ...requestData,
      remainingQuantity
    });
  } catch (error) {
    console.error('Error fetching request:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch request', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}