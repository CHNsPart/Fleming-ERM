import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function GET(request: Request) {
  const { isAuthenticated, getUser } = getKindeServerSession();
  
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  // If no userId provided and user is not admin, use authenticated user's ID
  const currentUser = await getUser();
  const queryUserId = userId || currentUser?.id;

  if (!queryUserId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const activeRequests = await prisma.request.findMany({
      where: {
        userId: queryUserId,
        status: {
          in: ['APPROVED', 'PARTIALLY_RETURNED']
        }
      },
      include: {
        equipment: {
          select: {
            id: true,
            name: true,
            imageUrl: true
          }
        }
      },
      orderBy: {
        pickupDate: 'desc'
      }
    });

    // Add remaining quantity calculation
    const requestsWithRemaining = activeRequests.map(request => ({
      ...request,
      remainingQuantity: request.quantity - request.returnedQuantity
    }));

    return NextResponse.json(requestsWithRemaining);
  } catch (error) {
    console.error('Error fetching active requests:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch active requests', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}