import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function GET() {
  const { isAuthenticated } = getKindeServerSession();
  
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
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
        email: true
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching active users:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch active users', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}