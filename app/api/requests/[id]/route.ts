import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { isAuthenticated, getUser } = getKindeServerSession();
  
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const currentUser = await getUser();
  const id = params.id;

  try {
    const requestData = await prisma.request.findUnique({
      where: { id },
      include: {
        user: {
          select: { 
            name: true, 
            email: true 
          }
        },
        equipment: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            availableQuantity: true,
            totalQuantity: true
          }
        }
      },
    });

    if (!requestData) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Check if user is admin or if the request belongs to the user
    if (currentUser?.email !== 'projectapplied02@gmail.com' && 
        requestData.user.email !== currentUser?.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Calculate remaining quantity and other stats
    const remainingQuantity = requestData.quantity - requestData.returnedQuantity;
    const stats = {
      remainingQuantity,
      progressPercentage: Math.round((requestData.returnedQuantity / requestData.quantity) * 100),
      returnedQuantity: requestData.returnedQuantity,
      totalQuantity: requestData.quantity
    };

    return NextResponse.json({
      ...requestData,
      stats
    });
  } catch (error) {
    console.error('Error fetching request:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch request', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}