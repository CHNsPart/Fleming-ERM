import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { isAuthenticated, getUser } = getKindeServerSession();
  
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await getUser();
  
  if (user?.email !== 'projectapplied02@gmail.com') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const id = params.id;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Fetch the request
      const equipmentRequest = await tx.request.findUnique({
        where: { id },
        include: {
          equipment: true,
          user: {
            select: { name: true, email: true }
          }
        },
      });

      if (!equipmentRequest) {
        throw new Error('Request not found');
      }

      if (equipmentRequest.status !== 'PENDING') {
        throw new Error('Request is not in a pending state');
      }

      if (equipmentRequest.equipment.availableQuantity < equipmentRequest.quantity) {
        throw new Error('Not enough inventory available');
      }

      // Update the equipment inventory
      const updatedEquipment = await tx.equipment.update({
        where: { id: equipmentRequest.equipment.id },
        data: {
          availableQuantity: {
            decrement: equipmentRequest.quantity
          },
        },
      });

      // Update the request status
      const updatedRequest = await tx.request.update({
        where: { id },
        data: { status: 'APPROVED' },
        include: {
          user: {
            select: { name: true, email: true }
          }
        },
      });

      return { updatedRequest, updatedEquipment };
    });

    console.log('Approval result:', result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error approving request:', error);
    return NextResponse.json({ 
      error: 'Failed to approve request', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}