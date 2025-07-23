interface EmailConfig {
  service: string;
  apiKey: string;
  fromEmail: string;
  fromName: string;
}

interface BookingConfirmationData {
  guestEmail: string;
  guestName: string;
  bookingId: string;
  hotelName: string;
  checkInDate: string;
  checkOutDate: string;
  totalAmount: number;
}

export class EmailService {
  private config: EmailConfig;

  constructor() {
    this.config = {
      service: process.env.EMAIL_SERVICE || "emailjs",
      apiKey: process.env.EMAILJS_PUBLIC_KEY || "your_emailjs_public_key",
      fromEmail: process.env.FROM_EMAIL || "bookings@bookneoapp.com",
      fromName: process.env.FROM_NAME || "BOOK NEO",
    };
  }

  async sendBookingConfirmation(data: BookingConfirmationData): Promise<void> {
    try {
      console.log("Sending booking confirmation email:", {
        to: data.guestEmail,
        bookingId: data.bookingId,
        guest: data.guestName
      });

      // Generate email template
      const emailTemplate = this.generateBookingConfirmationHTML(data);

      // For now, we'll use EmailJS or a similar service
      // In production, you might want to use SendGrid, AWS SES, or similar
      await this.sendEmailViaEmailJS({
        to_email: data.guestEmail,
        to_name: data.guestName,
        subject: `Booking Confirmation - ${data.bookingId}`,
        html_content: emailTemplate,
        booking_id: data.bookingId,
        hotel_name: data.hotelName,
        check_in: data.checkInDate,
        check_out: data.checkOutDate,
        amount: data.totalAmount.toString(),
      });

      console.log("Booking confirmation email sent successfully");
    } catch (error) {
      console.error("Failed to send booking confirmation email:", error);
      throw error;
    }
  }

  private async sendEmailViaEmailJS(templateParams: Record<string, string>): Promise<void> {
    try {
      // In a real implementation, you would make an API call to EmailJS
      // For now, we'll just log the email content
      console.log("Email would be sent with params:", templateParams);

      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Uncomment below for actual EmailJS integration:
      /*
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: process.env.EMAILJS_SERVICE_ID,
          template_id: process.env.EMAILJS_TEMPLATE_ID,
          user_id: this.config.apiKey,
          template_params: templateParams,
        }),
      });

      if (!response.ok) {
        throw new Error(`EmailJS API error: ${response.status}`);
      }
      */
    } catch (error) {
      console.error("EmailJS send error:", error);
      throw error;
    }
  }

  private generateBookingConfirmationHTML(data: BookingConfirmationData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation - ${data.bookingId}</title>
        <style>
          body { 
            font-family: 'Arial', sans-serif; 
            background-color: #f8fafc; 
            margin: 0; 
            padding: 20px; 
          }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 12px; 
            overflow: hidden; 
            box-shadow: 0 4px 20px rgba(0,0,0,0.1); 
          }
          .header { 
            background: linear-gradient(135deg, #6366f1, #ec4899); 
            color: white; 
            padding: 30px; 
            text-align: center; 
          }
          .content { 
            padding: 30px; 
          }
          .booking-details { 
            background: #f8fafc; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 20px 0; 
          }
          .detail-row { 
            display: flex; 
            justify-content: space-between; 
            margin: 10px 0; 
            padding: 8px 0; 
            border-bottom: 1px solid #e2e8f0; 
          }
          .detail-row:last-child { 
            border-bottom: none; 
            font-weight: bold; 
            font-size: 18px; 
          }
          .footer { 
            background: #1e293b; 
            color: white; 
            padding: 20px; 
            text-align: center; 
            font-size: 14px; 
          }
          .qr-section {
            text-align: center;
            padding: 20px;
            background: #f1f5f9;
            border-radius: 8px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏨 BOOK NEO</h1>
            <h2>Booking Confirmed!</h2>
            <p>Thank you for choosing ${data.hotelName}</p>
          </div>
          
          <div class="content">
            <p>Dear ${data.guestName},</p>
            <p>Your hotel booking has been confirmed. Here are your booking details:</p>
            
            <div class="booking-details">
              <div class="detail-row">
                <span>Booking ID:</span>
                <span><strong>${data.bookingId}</strong></span>
              </div>
              <div class="detail-row">
                <span>Hotel:</span>
                <span>${data.hotelName}</span>
              </div>
              <div class="detail-row">
                <span>Guest Name:</span>
                <span>${data.guestName}</span>
              </div>
              <div class="detail-row">
                <span>Check-in Date:</span>
                <span>${new Date(data.checkInDate).toLocaleDateString()}</span>
              </div>
              <div class="detail-row">
                <span>Check-out Date:</span>
                <span>${new Date(data.checkOutDate).toLocaleDateString()}</span>
              </div>
              <div class="detail-row">
                <span>Total Amount Paid:</span>
                <span style="color: #059669;">₹${data.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div class="qr-section">
              <h3>Quick Check-in QR Code</h3>
              <p>Show this QR code at the hotel reception for quick check-in</p>
              <div style="background: white; padding: 20px; border-radius: 8px; display: inline-block;">
                <p style="color: #6b7280; font-size: 12px;">QR Code will be generated here</p>
                <p style="color: #6b7280; font-size: 10px;">Booking ID: ${data.bookingId}</p>
              </div>
            </div>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
              <h4 style="margin: 0 0 10px 0; color: #92400e;">Important Information:</h4>
              <ul style="margin: 0; color: #92400e;">
                <li>Please arrive during check-in hours</li>
                <li>Carry a valid photo ID for verification</li>
                <li>Contact the hotel directly for any special requests</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>BOOK NEO</strong> - Premium Hotel Booking Experience</p>
            <p>For support, contact us at support@bookneoapp.com</p>
            <p style="font-size: 12px; opacity: 0.7;">
              This is an automated email. Please do not reply to this message.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendHotelNotification(hotelEmail: string, bookingData: any): Promise<void> {
    try {
      console.log("Sending hotel notification email:", {
        to: hotelEmail,
        bookingId: bookingData.bookingId
      });

      // Implementation for hotel notification emails
      // This would notify hotel staff of new bookings
      
    } catch (error) {
      console.error("Failed to send hotel notification:", error);
      throw error;
    }
  }

  async sendCancellationEmail(data: BookingConfirmationData): Promise<void> {
    try {
      console.log("Sending cancellation email:", {
        to: data.guestEmail,
        bookingId: data.bookingId
      });

      // Implementation for booking cancellation emails
      
    } catch (error) {
      console.error("Failed to send cancellation email:", error);
      throw error;
    }
  }
}
