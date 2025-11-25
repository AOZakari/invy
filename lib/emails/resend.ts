import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  throw new Error('Missing RESEND_API_KEY environment variable');
}

export const resend = new Resend(resendApiKey);

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export interface EventCreatedEmailData {
  organizerEmail: string;
  eventTitle: string;
  publicUrl: string;
  adminUrl: string;
}

export async function sendEventCreatedEmail(data: EventCreatedEmailData) {
  const { organizerEmail, eventTitle, publicUrl, adminUrl } = data;

  try {
    await resend.emails.send({
      from: 'INVY <noreply@invy.rsvp>', // TODO: Update with your verified domain
      to: organizerEmail,
      subject: `Your INVY "${eventTitle}" is ready!`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #000; font-size: 24px; margin-bottom: 20px;">Your INVY is ready! 🎉</h1>
            
            <p>Your event "<strong>${eventTitle}</strong>" has been created.</p>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="font-size: 18px; margin-top: 0;">Share your event:</h2>
              <p style="margin: 10px 0;">
                <a href="${publicUrl}" style="color: #0070f3; word-break: break-all;">${publicUrl}</a>
              </p>
            </div>
            
            <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <h2 style="font-size: 18px; margin-top: 0;">Manage your event:</h2>
              <p style="margin: 10px 0;">
                <a href="${adminUrl}" style="color: #0070f3; word-break: break-all;">${adminUrl}</a>
              </p>
              <p style="font-size: 14px; color: #666; margin-top: 10px;">
                ⚠️ Save this link! You'll need it to manage your event and view RSVPs.
              </p>
            </div>
            
            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              Questions? Just reply to this email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 12px; color: #999; text-align: center;">
              INVY — Collect RSVPs in seconds, no signups, no bullshit.
            </p>
          </body>
        </html>
      `,
      text: `
Your INVY is ready! 🎉

Your event "${eventTitle}" has been created.

Share your event:
${publicUrl}

Manage your event:
${adminUrl}

⚠️ Save this link! You'll need it to manage your event and view RSVPs.

Questions? Just reply to this email.

---
INVY — Collect RSVPs in seconds, no signups, no bullshit.
      `.trim(),
    });
  } catch (error) {
    console.error('Failed to send event created email:', error);
    throw error;
  }
}

