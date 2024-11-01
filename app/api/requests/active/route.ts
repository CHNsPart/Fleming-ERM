import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function GET() {
  const { isAuthenticated, getUser } = getKindeServerSession();
  
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await getUser();

  try {
    const activeRequests = await prisma.request.findMany({
      where: {
        userId: user?.id,
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

    return NextResponse.json(activeRequests);
  } catch (error) {
    console.error('Error fetching active requests:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch active requests', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}