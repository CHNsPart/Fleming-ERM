import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { sendEmail, getAdminEmails } from '@/lib/email';
import * as EmailTemplates from '@/lib/email-templates';

export async function POST(request: NextRequest) {
  const { isAuthenticated, getUser } = getKindeServerSession();
  
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const currentUser = await getUser();
  if (currentUser?.email !== 'projectapplied02@gmail.com') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { equipment } = body;

    const emailResults: any[] = [];

    const result = await prisma.$transaction(async (tx) => {
      for (const item of equipment) {
        if (item.returned > 0) {
          // Fetch the current request
          const currentRequest = await tx.request.findUnique({
            where: { id: item.id },
            include: { 
              equipment: true,
              user: {
                select: { name: true, email: true }
              }
            }
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

          // Store details for email
          emailResults.push({
            request: currentRequest,
            returnedQuantity: item.returned,
            newReturnedQuantity,
            totalQuantity: currentRequest.quantity
          });
        }
      }
    });

    // Send emails for each return
    const allEmailResults = await Promise.all(
      emailResults.map(async (returnData) => {
        const request = returnData.request;
        
        // Prepare data for email templates
        const emailData = {
          userName: request.user.name || 'User',
          userEmail: request.user.email || '',
          equipmentName: request.equipmentType,
          quantityReturned: returnData.returnedQuantity,
          totalQuantity: returnData.totalQuantity,
          returnDate: new Date(),
          requestId: request.id
        };

        // Send return confirmation emails
        const userEmailResult = await sendEmail(
          emailData.userEmail,
          EmailTemplates.returnUserEmail(emailData)
        );

        const adminEmailResult = await sendEmail(
          getAdminEmails(),
          EmailTemplates.returnAdminEmail(emailData)
        );

        return { request: request.id, userEmailResult, adminEmailResult };
      })
    );

    return NextResponse.json({ 
      message: 'Equipment return processed successfully',
      result,
      emailResults: allEmailResults
    });
  } catch (error) {
    console.error('Error processing equipment return:', error);
    return NextResponse.json({ 
      error: 'Failed to process equipment return', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}