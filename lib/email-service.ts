/**
 * Service for sending emails via the email API
 */

// Type definitions
type EquipmentRequestData = {
    userName: string;
    userEmail: string;
    equipmentName: string;
    quantity: number;
    purpose: string;
    pickupDate: Date | string;
    returnDate: Date | string;
    campus: string;
    requestId: string;
  };
  
  type EquipmentReturnData = {
    userName: string;
    userEmail: string;
    equipmentName: string;
    quantityReturned: number;
    totalQuantity: number;
    returnDate: Date | string;
    requestId: string;
  };
  
  type EmailType = 
    | 'new_request'
    | 'approval'
    | 'denial'
    | 'return';
  
  type EmailData = EquipmentRequestData | EquipmentReturnData;
  
  type EmailResponse = {
    success: boolean;
    result?: {
      userEmail: {
        success: boolean;
        error?: string;
        messageId?: string;
      };
      adminEmail: {
        success: boolean;
        error?: string;
        messageId?: string;
      };
    };
    error?: string;
  };
  
  /**
   * Send email through the API
   */
  export async function sendEmailNotification(
    type: EmailType,
    data: EmailData
  ): Promise<EmailResponse> {
    try {
      const response = await fetch('/api/email-service', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, data }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send email');
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error sending email notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Helper function for sending new request emails
   */
  export async function sendNewRequestEmails(data: EquipmentRequestData): Promise<EmailResponse> {
    return sendEmailNotification('new_request', data);
  }
  
  /**
   * Helper function for sending approval emails
   */
  export async function sendApprovalEmails(data: EquipmentRequestData): Promise<EmailResponse> {
    return sendEmailNotification('approval', data);
  }
  
  /**
   * Helper function for sending denial emails
   */
  export async function sendDenialEmails(data: EquipmentRequestData): Promise<EmailResponse> {
    return sendEmailNotification('denial', data);
  }
  
  /**
   * Helper function for sending return emails
   */
  export async function sendReturnEmails(data: EquipmentReturnData): Promise<EmailResponse> {
    return sendEmailNotification('return', data);
  }