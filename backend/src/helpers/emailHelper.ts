import { ServerClient, Models } from 'postmark';
import { getLogoURL, toBase64QRImage } from './stringHelper.js';

interface EmailReservationConfirmParams {
  email: string;
  name: string;
  url: string;
  reservationDateFormatted: Date;
  reservationNumber: number;
}

function formatDateForEmail(date: Date) {
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'short',
    year: 'numeric', 
    month: 'short', 
    day: 'numeric'
  };

  return date.toLocaleDateString('en-US', options);
}

const client = new ServerClient(process.env.POSTMARK_APIKEY!);

export async function sendEmailReservationConfirm(params: EmailReservationConfirmParams) {
  const {
    email,
    name,
    url,
    reservationDateFormatted,
    reservationNumber,
  } = params;

  const qrCodeImage = new Models.Attachment("qrcode.jpg", await toBase64QRImage(url), "image/jpeg", "qrcode");

  try {
    return client.sendEmail({
      "From": "Example <noreply@example.com>",
      "To": email,
      "Subject": "Your Reservation Confirmation",
      "HtmlBody": `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reservation Confirmation</title>
          <style>
            body {
              font-family: 'Roboto', Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              background-color: #ffffff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              border: 1px solid #dddddd;
            }
            .header {
              background-color: #2c3e50;
              color: #ffffff;
              text-align: center;
              padding: 10px 0;
              border-radius: 8px 8px 0 0;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
            }
            .content {
              padding: 20px;
              color: #333333;
              font-size: 16px;
            }
            .footer {
              text-align: center;
              padding: 10px 0;
              border-top: 1px solid #dddddd;
              font-size: 12px;
              color: #777777;
              background-color: #f4f4f4;
              border-radius: 0 0 8px 8px;
            }
            .qr-code {
              text-align: center;
              margin: 20px 0;
            }
            .qr-code img {
              max-width: 200px;
              height: auto;
            }
            ul {
              list-style: none;
              padding: 0;
            }
            li {
              padding: 5px 0;
            }
            li strong {
              color: #2c3e50;
            }
            a {
              color: #2c3e50;
              text-decoration: underline;
              font-size: 16px;
            }
            .social {
              text-align: center;
              font-size: 16px;
            }
            .social span, .social a {
              display: inline-block;
              vertical-align: middle;
            }
            .logo {
              text-align: center;
            }
            .logo img {
              max-width: 150px;
              height: auto;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Reservation Confirmation</h1>
            </div>
            <div class="content">
              <p>Greetings ${name},</p>
              <p>Thank you for your reservation. Below is your QR code for entry:</p>
              <div class="qr-code">
                <a href="${url}" target="_blank">
                  <img src="cid:qrcode" alt="Loading... QR Code">
                </a>
              </div>
              <p>Reservation Details:</p>
              <ul>
                <li><strong>Date:</strong> ${formatDateForEmail(reservationDateFormatted)}</li>
                <li><strong>Reservation Number:</strong> ${reservationNumber}</li>
              </ul>
              <p>We look forward to seeing you!</p>
              <p>Best regards,<br>The Team</p>
              <div class="social">
                <span>Please like and share our Facebook page: </span>
                <a href="https://www.facebook.com/example" target="_blank">Example</a>
              </div>
            </div>
            <div class="logo">
              <img src="${getLogoURL()}" alt="Example">
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} The Team. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      "Attachments" : [qrCodeImage],
      "MessageStream": "outbound"
    })
  } catch (error) {
    console.error('Error sending email', error);
    throw error
  }
}