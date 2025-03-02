import { NextRequest, NextResponse } from 'next/server';
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { sendEmail, getAdminEmails, EmailResponse } from '@/lib/email';
import * as EmailTemplates from '@/lib/email-templates';

export async function POST(request: NextRequest) {
  const { isAuthenticated, getUser } = getKindeServerSession();
  
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const user = await getUser();
    const isAdmin = user?.email === 'projectapplied02@gmail.com';

    // Make sure only admin can send certain email types
    if (['approval', 'denial', 'return'].includes(type) && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let result;

    switch (type) {
      case 'new_request':
        // Send email to user
        const userResult = await sendEmail(
          data.userEmail,
          EmailTemplates.newRequestUserEmail(data)
        );
        
        // Send email to admin
        const adminResult = await sendEmail(
          getAdminEmails(),
          EmailTemplates.newRequestAdminEmail(data)
        );
        
        result = {
          userEmail: userResult,
          adminEmail: adminResult
        };
        break;
        
      case 'approval':
        // Send email to user
        const approvalUserResult = await sendEmail(
          data.userEmail,
          EmailTemplates.approvalUserEmail(data)
        );
        
        // Send email to admin
        const approvalAdminResult = await sendEmail(
          getAdminEmails(),
          EmailTemplates.approvalAdminEmail(data)
        );
        
        result = {
          userEmail: approvalUserResult,
          adminEmail: approvalAdminResult
        };
        break;
        
      case 'denial':
        // Send email to user
        const denialUserResult = await sendEmail(
          data.userEmail,
          EmailTemplates.denialUserEmail(data)
        );
        
        // Send email to admin
        const denialAdminResult = await sendEmail(
          getAdminEmails(),
          EmailTemplates.denialAdminEmail(data)
        );
        
        result = {
          userEmail: denialUserResult,
          adminEmail: denialAdminResult
        };
        break;
        
      case 'return':
        // Send email to user
        const returnUserResult = await sendEmail(
          data.userEmail,
          EmailTemplates.returnUserEmail(data)
        );
        
        // Send email to admin
        const returnAdminResult = await sendEmail(
          getAdminEmails(),
          EmailTemplates.returnAdminEmail(data)
        );
        
        result = {
          userEmail: returnUserResult,
          adminEmail: returnAdminResult
        };
        break;
        
      default:
        return NextResponse.json({ error: 'Invalid email type' }, { status: 400 });
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ 
      error: 'Failed to send email', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}