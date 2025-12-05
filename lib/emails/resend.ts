import { Resend } from 'resend';
import type { RSVPStatus } from '@/types/database';
import { logEmailSent, logEmailFailed } from '@/lib/logging/emails';

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
  manageUrl: string;
  eventId?: string;
}

export interface RsvpConfirmationEmailData {
  guestEmail: string;
  guestName: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  eventUrl: string;
  eventId?: string;
}

export interface OrganizerRsvpEmailData {
  organizerEmail: string;
  eventTitle: string;
  guestName: string;
  guestStatus: RSVPStatus;
  guestContact: string;
  guestPlusOne: number;
  manageUrl: string;
  publicUrl: string;
  eventId?: string;
}

export async function sendEventCreatedEmail(data: EventCreatedEmailData) {
  const { organizerEmail, eventTitle, publicUrl, manageUrl, eventId } = data;

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
                <a href="${manageUrl}" style="color: #0070f3; word-break: break-all;">${manageUrl}</a>
              </p>
              <p style="font-size: 14px; color: #666; margin-top: 10px;">
                ⚠️ Save this link! You'll need it to manage your event and view RSVPs.
              </p>
            </div>
            
            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              Questions? Email us at <a href="mailto:contact@invy.rsvp" style="color: #0070f3;">contact@invy.rsvp</a>.
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
${manageUrl}

⚠️ Save this link! You'll need it to manage your event and view RSVPs.

Questions? Email us at contact@invy.rsvp.

---
INVY — Collect RSVPs in seconds, no signups, no bullshit.
      `.trim(),
    });

    // Log successful send
    await logEmailSent(organizerEmail, `Your INVY "${eventTitle}" is ready!`, eventId);
  } catch (error) {
    console.error('Failed to send event created email:', error);
    // Log failed send
    await logEmailFailed(
      organizerEmail,
      `Your INVY "${eventTitle}" is ready!`,
      error instanceof Error ? error.message : 'Unknown error',
      eventId
    );
    throw error;
  }
}

export async function sendRsvpConfirmationEmail(data: RsvpConfirmationEmailData) {
  const { guestEmail, guestName, eventTitle, eventDate, eventLocation, eventUrl, eventId } = data;

  const date = new Date(eventDate);
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  try {
    await resend.emails.send({
      from: 'INVY <noreply@invy.rsvp>', // TODO: Update with your verified domain
      to: guestEmail,
      subject: `You're on the list for ${eventTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #000; font-size: 24px; margin-bottom: 20px;">Thanks for RSVPing, ${guestName}!</h1>
            <p>You're confirmed for <strong>${eventTitle}</strong>.</p>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Date:</strong> ${formattedDate}</p>
              <p style="margin: 4px 0 0;"><strong>Time:</strong> ${formattedTime}</p>
              <p style="margin: 4px 0 0;"><strong>Location:</strong> ${eventLocation}</p>
            </div>

            <p style="margin: 20px 0;">
              View the event details anytime:
              <br />
              <a href="${eventUrl}" style="color: #0070f3; word-break: break-all;">${eventUrl}</a>
            </p>

            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              Questions? Email us at <a href="mailto:contact@invy.rsvp" style="color: #0070f3;">contact@invy.rsvp</a>.
            </p>

            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 12px; color: #999; text-align: center;">
              INVY — Collect RSVPs in seconds, no signups, no bullshit.
            </p>
          </body>
        </html>
      `,
      text: `
Thanks for RSVPing, ${guestName}!

You're confirmed for ${eventTitle}.

Date: ${formattedDate}
Time: ${formattedTime}
Location: ${eventLocation}

View the event details anytime:
${eventUrl}

Questions? Email us at contact@invy.rsvp.

---
INVY — Collect RSVPs in seconds, no signups, no bullshit.
      `.trim(),
    });

    // Log successful send
    await logEmailSent(guestEmail, `You're on the list for ${eventTitle}`, eventId);
  } catch (error) {
    console.error('Failed to send RSVP confirmation email:', error);
    // Log failed send
    await logEmailFailed(
      guestEmail,
      `You're on the list for ${eventTitle}`,
      error instanceof Error ? error.message : 'Unknown error',
      eventId
    );
    throw error;
  }
}

export async function sendOrganizerRsvpEmail(data: OrganizerRsvpEmailData) {
  const { organizerEmail, eventTitle, guestName, guestStatus, guestContact, guestPlusOne, manageUrl, publicUrl, eventId } = data;

  try {
    await resend.emails.send({
      from: 'INVY <noreply@invy.rsvp>', // TODO: Update with your verified domain
      to: organizerEmail,
      subject: `${guestName} just RSVPed to ${eventTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #000; font-size: 22px; margin-bottom: 16px;">New RSVP for ${eventTitle}</h1>
            <p style="margin: 0 0 12px;">${guestName} responded <strong>${guestStatus.toUpperCase()}</strong>${guestPlusOne > 0 ? ` with +${guestPlusOne}` : ''}.</p>
            <p style="margin: 0 0 12px;">Contact: <strong>${guestContact}</strong></p>

            <div style="margin: 24px 0;">
              <a href="${manageUrl}" style="display: inline-block; padding: 12px 18px; background: #000; color: #fff; text-decoration: none; border-radius: 6px;">Manage RSVPs</a>
              <a href="${publicUrl}" style="display: inline-block; padding: 12px 18px; margin-left: 8px; border: 1px solid #000; color: #000; text-decoration: none; border-radius: 6px;">View Event</a>
            </div>

            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              Questions? Email us at <a href="mailto:contact@invy.rsvp" style="color: #0070f3;">contact@invy.rsvp</a>.
            </p>

            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 12px; color: #999; text-align: center;">
              INVY — Collect RSVPs in seconds, no signups, no bullshit.
            </p>
          </body>
        </html>
      `,
      text: `
New RSVP for ${eventTitle}

${guestName} responded ${guestStatus.toUpperCase()}${guestPlusOne > 0 ? ` with +${guestPlusOne}` : ''}.
Contact: ${guestContact}

Manage RSVPs: ${manageUrl}
View event: ${publicUrl}

Questions? Email us at contact@invy.rsvp.

---
INVY — Collect RSVPs in seconds, no signups, no bullshit.
      `.trim(),
    });

    // Log successful send
    await logEmailSent(
      organizerEmail,
      `${guestName} just RSVPed to ${eventTitle}`,
      eventId
    );
  } catch (error) {
    console.error('Failed to send organizer RSVP email:', error);
    // Log failed send
    await logEmailFailed(
      organizerEmail,
      `${guestName} just RSVPed to ${eventTitle}`,
      error instanceof Error ? error.message : 'Unknown error',
      eventId
    );
    throw error;
  }
}

