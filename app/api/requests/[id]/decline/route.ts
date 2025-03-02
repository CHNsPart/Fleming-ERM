import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { sendEmail, getAdminEmails } from '@/lib/email';
import * as EmailTemplates from '@/lib/email-templates';

export async function POST(_: NextRequest, { params }: { params: { id: string } }) {
  const { isAuthenticated, getUser } = getKindeServerSession();
  
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await getUser();
  if (user?.email !== 'projectapplied02@gmail.com') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  try {
    const id = params.id;
    
    // First verify the request exists and is in a valid state
    const existingRequest = await prisma.request.findUnique({
      where: { id },
      include: {
        equipment: true,
        user: {
          select: { name: true, email: true }
        }
      }
    });

    if (!existingRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    if (existingRequest.status !== 'PENDING') {
      return NextResponse.json({ 
        error: 'Only pending requests can be declined' 
      }, { status: 400 });
    }

    const updatedRequest = await prisma.request.update({
      where: { id },
      data: { status: 'DECLINED' },
    });
    
    // Prepare email data
    const emailData = {
      userName: existingRequest.user.name || 'User',
      userEmail: existingRequest.user.email || '',
      equipmentName: existingRequest.equipmentType,
      quantity: existingRequest.quantity,
      purpose: existingRequest.purpose,
      pickupDate: existingRequest.pickupDate,
      returnDate: existingRequest.returnDate,
      campus: existingRequest.campus,
      requestId: existingRequest.id
    };

    // Send denial emails
    const userEmailResult = await sendEmail(
      emailData.userEmail,
      EmailTemplates.denialUserEmail(emailData)
    );

    const adminEmailResult = await sendEmail(
      getAdminEmails(),
      EmailTemplates.denialAdminEmail(emailData)
    );

    console.log('Decline result:', updatedRequest);
    console.log('Email results:', { user: userEmailResult, admin: adminEmailResult });
    
    return NextResponse.json({
      ...updatedRequest,
      emailSent: userEmailResult.success && adminEmailResult.success
    });
  } catch (error) {
    console.error('Error declining request:', error);
    return NextResponse.json({ 
      error: 'Failed to decline request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}