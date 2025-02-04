import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function GET() {
  const { isAuthenticated, getUser } = getKindeServerSession();
  
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const currentUser = await getUser();
  if (currentUser?.email !== 'projectapplied02@gmail.com') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const activeUsers = await prisma.user.findMany({
      where: {
        requests: {
          some: {
            status: {
              in: ['APPROVED', 'PARTIALLY_RETURNED']
            }
          }
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        requests: {
          where: {
            status: {
              in: ['APPROVED', 'PARTIALLY_RETURNED']
            }
          },
          select: {
            id: true,
            quantity: true,
            returnedQuantity: true,
            equipmentType: true,
            status: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Transform the data to include summary information
    const usersWithSummary = activeUsers.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      activeRequestsCount: user.requests.length,
      totalItemsOut: user.requests.reduce((acc, req) => 
        acc + (req.quantity - req.returnedQuantity), 0)
    }));

    return NextResponse.json(usersWithSummary);
  } catch (error) {
    console.error('Error fetching active users:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch active users', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}