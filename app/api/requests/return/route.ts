import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function POST(request: NextRequest) {
  const { isAuthenticated } = getKindeServerSession();
  
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { equipment } = body;

    const result = await prisma.$transaction(async (tx) => {
      for (const item of equipment) {
        if (item.returned > 0) {
          // Fetch the current request
          const currentRequest = await tx.request.findUnique({
            where: { id: item.id },
            include: { equipment: true }
          });

          if (!currentRequest) {
            throw new Error(`Request not found for ID: ${item.id}`);
          }

          const newReturnedQuantity = currentRequest.returnedQuantity + item.returned;
          
          if (newReturnedQuantity > currentRequest.quantity) {
            throw new Error(`Cannot return more than requested for request ID: ${item.id}`);
          }

          // Update the request status and returnedQuantity
          await tx.request.update({
            where: { id: item.id },
            data: {
              status: newReturnedQuantity === currentRequest.quantity ? 'RETURNED' : 'PARTIALLY_RETURNED',
              returnedQuantity: newReturnedQuantity
            },
          });

          // Update the equipment inventory
          await tx.equipment.update({
            where: { id: currentRequest.equipment.id },
            data: {
              availableQuantity: {
                increment: item.returned
              }
            },
          });
        }
      }
    });

    return NextResponse.json({ 
      message: 'Equipment return processed successfully',
      result 
    });
  } catch (error) {
    console.error('Error processing equipment return:', error);
    return NextResponse.json({ 
      error: 'Failed to process equipment return', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}