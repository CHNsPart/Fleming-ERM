import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { sendEmail, getAdminEmails } from '@/lib/email';
import * as EmailTemplates from '@/lib/email-templates';

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

      return { updatedRequest, updatedEquipment, equipmentRequest };
    });

    // Prepare email data
    const emailData = {
      userName: result.equipmentRequest.user.name || 'User',
      userEmail: result.equipmentRequest.user.email || '',
      equipmentName: result.equipmentRequest.equipmentType,
      quantity: result.equipmentRequest.quantity,
      purpose: result.equipmentRequest.purpose,
      pickupDate: result.equipmentRequest.pickupDate,
      returnDate: result.equipmentRequest.returnDate,
      campus: result.equipmentRequest.campus,
      requestId: result.equipmentRequest.id
    };

    // Send approval emails
    const userEmailResult = await sendEmail(
      emailData.userEmail,
      EmailTemplates.approvalUserEmail(emailData)
    );

    const adminEmailResult = await sendEmail(
      getAdminEmails(),
      EmailTemplates.approvalAdminEmail(emailData)
    );

    console.log('Approval result:', result);
    console.log('Email results:', { user: userEmailResult, admin: adminEmailResult });
    
    return NextResponse.json({
      ...result,
      emailSent: userEmailResult.success && adminEmailResult.success
    });
  } catch (error) {
    console.error('Error approving request:', error);
    return NextResponse.json({ 
      error: 'Failed to approve request', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}