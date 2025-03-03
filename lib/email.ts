import { Resend } from 'resend';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Email sender configuration
const FROM_EMAIL = process.env.FROM_EMAIL || 'Equipment System <system-notify@fleminginventorysystem.online>';
const ADMIN_EMAIL = 'projectapplied02@gmail.com';

// Define email template types
type EmailTemplateProps = {
  subject: string;
  previewText: string;
  html: string;
}

export type EmailResponse = {
  success: boolean;
  error?: string;
  messageId?: string;
}

/**
 * Send an email using Resend
 */
export async function sendEmail(
  to: string | string[],
  { subject, previewText, html }: EmailTemplateProps
): Promise<EmailResponse> {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text: previewText, // Fallback for email clients that don't support HTML
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      messageId: data?.id
    };
  } catch (error) {
    console.error('Failed to send email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Get admin email(s)
 */
export function getAdminEmails(): string[] {
  // Currently only one admin, but could be extended to support multiple admins
  return [ADMIN_EMAIL];
}