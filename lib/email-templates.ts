// Base HTML template for all emails
function baseTemplate(content: string, previewText: string): string {
    return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Equipment Request System</title>
    <meta name="description" content="${previewText}">
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        line-height: 1.5;
        color: #333;
        margin: 0;
        padding: 0;
      }
      .email-container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
      }
      .email-header {
        background-color: #f8f9fa;
        padding: 20px;
        text-align: center;
        border-radius: 5px 5px 0 0;
      }
      .email-body {
        background-color: #ffffff;
        padding: 30px;
        border-radius: 0 0 5px 5px;
        border: 1px solid #e9ecef;
        border-top: none;
      }
      .email-footer {
        text-align: center;
        padding: 20px;
        font-size: 12px;
        color: #6c757d;
      }
      .button {
        display: inline-block;
        background-color: #0069d9;
        color: #ffffff !important;
        text-decoration: none;
        padding: 10px 20px;
        border-radius: 5px;
        margin: 20px 0;
        font-weight: bold;
      }
      .info-box {
        background-color: #f8f9fa;
        padding: 15px;
        border-radius: 5px;
        margin: 15px 0;
      }
      .status-approved {
        color: #28a745;
        font-weight: bold;
      }
      .status-denied {
        color: #dc3545;
        font-weight: bold;
      }
      .status-pending {
        color: #ffc107;
        font-weight: bold;
      }
      .status-returned {
        color: #6f42c1;
        font-weight: bold;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th, td {
        padding: 8px;
        text-align: left;
        border-bottom: 1px solid #e9ecef;
      }
      th {
        background-color: #f8f9fa;
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="email-header">
        <h1 style="margin: 0; color: #212529;">Equipment Request System</h1>
      </div>
      <div class="email-body">
        ${content}
      </div>
      <div class="email-footer">
        <p>© ${new Date().getFullYear()} Equipment Request System. All rights reserved.</p>
        <p>This is an automated message, please do not reply directly to this email.</p>
      </div>
    </div>
  </body>
  </html>
    `;
  }
  
  // Type definitions for request data
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
  
  // Format date to readable string
  function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  // 1. New Equipment Request Templates
  export function newRequestUserEmail(data: EquipmentRequestData) {
    const previewText = `Your equipment request for ${data.equipmentName} was submitted successfully`;
    
    const content = `
      <h2>Request Submitted Successfully</h2>
      <p>Hello ${data.userName},</p>
      <p>Your request for <strong>${data.equipmentName}</strong> has been submitted successfully.</p>
      
      <div class="info-box">
        <h3>Request Details:</h3>
        <table>
          <tr>
            <td><strong>Equipment:</strong></td>
            <td>${data.equipmentName}</td>
          </tr>
          <tr>
            <td><strong>Quantity:</strong></td>
            <td>${data.quantity}</td>
          </tr>
          <tr>
            <td><strong>Pickup Date:</strong></td>
            <td>${formatDate(data.pickupDate)}</td>
          </tr>
          <tr>
            <td><strong>Return Date:</strong></td>
            <td>${formatDate(data.returnDate)}</td>
          </tr>
          <tr>
            <td><strong>Campus:</strong></td>
            <td>${data.campus}</td>
          </tr>
          <tr>
            <td><strong>Status:</strong></td>
            <td><span class="status-pending">Pending Approval</span></td>
          </tr>
        </table>
      </div>
      
      <p>Your request is now pending approval from an administrator. You will receive an email notification once your request has been reviewed.</p>
      
      <p>If you have any questions, please contact the equipment management team.</p>
      
      <p>Thank you for using our Equipment Request System.</p>
    `;
    
    return {
      subject: `Equipment Request Submitted - ${data.equipmentName}`,
      previewText,
      html: baseTemplate(content, previewText)
    };
  }
  
  export function newRequestAdminEmail(data: EquipmentRequestData) {
    const previewText = `New equipment request from ${data.userName} for ${data.equipmentName}`;
    
    const content = `
      <h2>New Equipment Request</h2>
      <p>A new equipment request has been submitted and requires your approval.</p>
      
      <div class="info-box">
        <h3>Request Details:</h3>
        <table>
          <tr>
            <td><strong>User:</strong></td>
            <td>${data.userName} (${data.userEmail})</td>
          </tr>
          <tr>
            <td><strong>Equipment:</strong></td>
            <td>${data.equipmentName}</td>
          </tr>
          <tr>
            <td><strong>Quantity:</strong></td>
            <td>${data.quantity}</td>
          </tr>
          <tr>
            <td><strong>Purpose:</strong></td>
            <td>${data.purpose}</td>
          </tr>
          <tr>
            <td><strong>Pickup Date:</strong></td>
            <td>${formatDate(data.pickupDate)}</td>
          </tr>
          <tr>
            <td><strong>Return Date:</strong></td>
            <td>${formatDate(data.returnDate)}</td>
          </tr>
          <tr>
            <td><strong>Campus:</strong></td>
            <td>${data.campus}</td>
          </tr>
        </table>
      </div>
      
      <p>Please log in to the system to approve or decline this request.</p>
      
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">Go to Dashboard</a>
    `;
    
    return {
      subject: `New Equipment Request - ${data.equipmentName}`,
      previewText,
      html: baseTemplate(content, previewText)
    };
  }
  
  // 2. Request Approval Templates
  export function approvalUserEmail(data: EquipmentRequestData) {
    const previewText = `Your equipment request for ${data.equipmentName} has been approved`;
    
    const content = `
      <h2>Request Approved</h2>
      <p>Hello ${data.userName},</p>
      <p>Great news! Your request for <strong>${data.equipmentName}</strong> has been <span class="status-approved">approved</span>.</p>
      
      <div class="info-box">
        <h3>Request Details:</h3>
        <table>
          <tr>
            <td><strong>Equipment:</strong></td>
            <td>${data.equipmentName}</td>
          </tr>
          <tr>
            <td><strong>Quantity:</strong></td>
            <td>${data.quantity}</td>
          </tr>
          <tr>
            <td><strong>Pickup Date:</strong></td>
            <td>${formatDate(data.pickupDate)}</td>
          </tr>
          <tr>
            <td><strong>Return Date:</strong></td>
            <td>${formatDate(data.returnDate)}</td>
          </tr>
          <tr>
            <td><strong>Campus:</strong></td>
            <td>${data.campus}</td>
          </tr>
          <tr>
            <td><strong>Status:</strong></td>
            <td><span class="status-approved">Approved</span></td>
          </tr>
        </table>
      </div>
      
      <p>You can now pick up your equipment on the scheduled date. Please bring your ID when you come to collect the equipment.</p>
      
      <p>Remember that you are responsible for returning the equipment by ${formatDate(data.returnDate)}.</p>
      
      <p>If you have any questions, please contact the equipment management team.</p>
      
      <p>Thank you for using our Equipment Request System.</p>
    `;
    
    return {
      subject: `Equipment Request Approved - ${data.equipmentName}`,
      previewText,
      html: baseTemplate(content, previewText)
    };
  }
  
  export function approvalAdminEmail(data: EquipmentRequestData) {
    const previewText = `You approved ${data.userName}'s request for ${data.equipmentName}`;
    
    const content = `
      <h2>Request Approval Confirmation</h2>
      <p>You have approved a request for <strong>${data.equipmentName}</strong> from ${data.userName}.</p>
      
      <div class="info-box">
        <h3>Request Details:</h3>
        <table>
          <tr>
            <td><strong>User:</strong></td>
            <td>${data.userName} (${data.userEmail})</td>
          </tr>
          <tr>
            <td><strong>Equipment:</strong></td>
            <td>${data.equipmentName}</td>
          </tr>
          <tr>
            <td><strong>Quantity:</strong></td>
            <td>${data.quantity}</td>
          </tr>
          <tr>
            <td><strong>Pickup Date:</strong></td>
            <td>${formatDate(data.pickupDate)}</td>
          </tr>
          <tr>
            <td><strong>Return Date:</strong></td>
            <td>${formatDate(data.returnDate)}</td>
          </tr>
          <tr>
            <td><strong>Campus:</strong></td>
            <td>${data.campus}</td>
          </tr>
          <tr>
            <td><strong>Status:</strong></td>
            <td><span class="status-approved">Approved</span></td>
          </tr>
        </table>
      </div>
      
      <p>The inventory has been updated automatically, and the user has been notified about the approval.</p>
      
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">View Dashboard</a>
    `;
    
    return {
      subject: `Equipment Request Approved - ${data.equipmentName}`,
      previewText,
      html: baseTemplate(content, previewText)
    };
  }
  
  // 3. Request Denial Templates
  export function denialUserEmail(data: EquipmentRequestData) {
    const previewText = `Your equipment request for ${data.equipmentName} has been declined`;
    
    const content = `
      <h2>Request Declined</h2>
      <p>Hello ${data.userName},</p>
      <p>We regret to inform you that your request for <strong>${data.equipmentName}</strong> has been <span class="status-denied">declined</span>.</p>
      
      <div class="info-box">
        <h3>Request Details:</h3>
        <table>
          <tr>
            <td><strong>Equipment:</strong></td>
            <td>${data.equipmentName}</td>
          </tr>
          <tr>
            <td><strong>Quantity:</strong></td>
            <td>${data.quantity}</td>
          </tr>
          <tr>
            <td><strong>Status:</strong></td>
            <td><span class="status-denied">Declined</span></td>
          </tr>
        </table>
      </div>
      
      <p>This could be due to various reasons such as equipment unavailability, scheduling conflicts, or policy restrictions.</p>
      
      <p>If you believe this is an error or you would like more information about why your request was declined, please contact the equipment management team.</p>
      
      <p>You are welcome to submit a new request with different parameters if needed.</p>
      
      <p>Thank you for your understanding.</p>
    `;
    
    return {
      subject: `Equipment Request Declined - ${data.equipmentName}`,
      previewText,
      html: baseTemplate(content, previewText)
    };
  }
  
  export function denialAdminEmail(data: EquipmentRequestData) {
    const previewText = `You declined ${data.userName}'s request for ${data.equipmentName}`;
    
    const content = `
      <h2>Request Denial Confirmation</h2>
      <p>You have declined a request for <strong>${data.equipmentName}</strong> from ${data.userName}.</p>
      
      <div class="info-box">
        <h3>Request Details:</h3>
        <table>
          <tr>
            <td><strong>User:</strong></td>
            <td>${data.userName} (${data.userEmail})</td>
          </tr>
          <tr>
            <td><strong>Equipment:</strong></td>
            <td>${data.equipmentName}</td>
          </tr>
          <tr>
            <td><strong>Quantity:</strong></td>
            <td>${data.quantity}</td>
          </tr>
          <tr>
            <td><strong>Status:</strong></td>
            <td><span class="status-denied">Declined</span></td>
          </tr>
        </table>
      </div>
      
      <p>The user has been notified that their request has been declined.</p>
      
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">View Dashboard</a>
    `;
    
    return {
      subject: `Equipment Request Declined - ${data.equipmentName}`,
      previewText,
      html: baseTemplate(content, previewText)
    };
  }
  
  // 4. Equipment Return Templates
  export function returnUserEmail(data: EquipmentReturnData) {
    const previewText = `Equipment return confirmation - ${data.equipmentName}`;
    
    const content = `
      <h2>Equipment Return Confirmation</h2>
      <p>Hello ${data.userName},</p>
      <p>This is to confirm that you have returned <strong>${data.quantityReturned}</strong> units of <strong>${data.equipmentName}</strong>.</p>
      
      <div class="info-box">
        <h3>Return Details:</h3>
        <table>
          <tr>
            <td><strong>Equipment:</strong></td>
            <td>${data.equipmentName}</td>
          </tr>
          <tr>
            <td><strong>Quantity Returned:</strong></td>
            <td>${data.quantityReturned} of ${data.totalQuantity}</td>
          </tr>
          <tr>
            <td><strong>Return Date:</strong></td>
            <td>${formatDate(data.returnDate)}</td>
          </tr>
          <tr>
            <td><strong>Status:</strong></td>
            <td>
              <span class="${data.quantityReturned === data.totalQuantity ? 'status-returned' : 'status-pending'}">
                ${data.quantityReturned === data.totalQuantity ? 'Fully Returned' : 'Partially Returned'}
              </span>
            </td>
          </tr>
        </table>
      </div>
      
      ${data.quantityReturned < data.totalQuantity ? 
        `<p>You still have <strong>${data.totalQuantity - data.quantityReturned}</strong> units to return.</p>` : 
        `<p>Thank you for returning all equipment as scheduled.</p>`
      }
      
      <p>If you have any questions about this return, please contact the equipment management team.</p>
      
      <p>Thank you for using our Equipment Request System.</p>
    `;
    
    return {
      subject: `Equipment Return Confirmation - ${data.equipmentName}`,
      previewText,
      html: baseTemplate(content, previewText)
    };
  }
  
  export function returnAdminEmail(data: EquipmentReturnData) {
    const previewText = `Equipment return processed - ${data.equipmentName} from ${data.userName}`;
    
    const content = `
      <h2>Equipment Return Processed</h2>
      <p>You have processed a return of <strong>${data.quantityReturned}</strong> units of <strong>${data.equipmentName}</strong> from ${data.userName}.</p>
      
      <div class="info-box">
        <h3>Return Details:</h3>
        <table>
          <tr>
            <td><strong>User:</strong></td>
            <td>${data.userName} (${data.userEmail})</td>
          </tr>
          <tr>
            <td><strong>Equipment:</strong></td>
            <td>${data.equipmentName}</td>
          </tr>
          <tr>
            <td><strong>Quantity Returned:</strong></td>
            <td>${data.quantityReturned} of ${data.totalQuantity}</td>
          </tr>
          <tr>
            <td><strong>Return Date:</strong></td>
            <td>${formatDate(data.returnDate)}</td>
          </tr>
          <tr>
            <td><strong>Status:</strong></td>
            <td>
              <span class="${data.quantityReturned === data.totalQuantity ? 'status-returned' : 'status-pending'}">
                ${data.quantityReturned === data.totalQuantity ? 'Fully Returned' : 'Partially Returned'}
              </span>
            </td>
          </tr>
        </table>
      </div>
      
      <p>The inventory has been updated automatically, and the user has been notified about the return.</p>
      
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">View Dashboard</a>
    `;
    
    return {
      subject: `Equipment Return Processed - ${data.equipmentName}`,
      previewText,
      html: baseTemplate(content, previewText)
    };
  }