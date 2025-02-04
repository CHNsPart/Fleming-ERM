import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function GET() {
  const { isAuthenticated } = getKindeServerSession();
  
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch all equipment with their active requests
    const inventory = await prisma.equipment.findMany({
      include: {
        requests: {
          where: {
            status: {
              in: ['APPROVED', 'PARTIALLY_RETURNED']
            }
          },
          select: {
            quantity: true,
            returnedQuantity: true,
            status: true,
            pickupDate: true,
            returnDate: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Calculate additional statistics for each equipment
    const inventoryWithStats = inventory.map(item => {
      const activeRequests = item.requests;
      const itemsInUse = activeRequests.reduce((total, req) => 
        total + (req.quantity - req.returnedQuantity), 0);

      return {
        id: item.id,
        name: item.name,
        totalQuantity: item.totalQuantity,
        availableQuantity: item.availableQuantity,
        imageUrl: item.imageUrl,
        stats: {
          inUse: itemsInUse,
          utilizationRate: ((itemsInUse / item.totalQuantity) * 100).toFixed(2) + '%',
          activeRequestsCount: activeRequests.length,
          nearingReturn: activeRequests.filter(req => {
            const returnDate = new Date(req.returnDate);
            const today = new Date();
            const daysUntilReturn = Math.ceil((returnDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
            return daysUntilReturn <= 3 && daysUntilReturn > 0;
          }).length
        }
      };
    });

    return NextResponse.json(inventoryWithStats, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch inventory', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';