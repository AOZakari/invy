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
  hideBranding?: boolean;
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
  hideBranding?: boolean;
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

const INVY_FOOTER_HTML = `
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 12px; color: #999; text-align: center;">
              INVY — Collect RSVPs in seconds, no signups, no bullshit.
            </p>`;
const INVY_FOOTER_TEXT = `

---
INVY — Collect RSVPs in seconds, no signups, no bullshit.`;

export async function sendRsvpConfirmationEmail(data: RsvpConfirmationEmailData) {
  const { guestEmail, guestName, eventTitle, eventDate, eventLocation, eventUrl, eventId, hideBranding } = data;
  const footerHtml = hideBranding ? '' : INVY_FOOTER_HTML;
  const footerText = hideBranding ? '' : INVY_FOOTER_TEXT;

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
${footerHtml}
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

Questions? Email us at contact@invy.rsvp.${footerText}
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
  const { organizerEmail, eventTitle, guestName, guestStatus, guestContact, guestPlusOne, manageUrl, publicUrl, eventId, hideBranding } = data;
  const footerHtml = hideBranding ? '' : INVY_FOOTER_HTML;
  const footerText = hideBranding ? '' : INVY_FOOTER_TEXT;

  const isRequest = guestStatus === 'pending';
  const subject = isRequest ? `New request for ${eventTitle}` : `${guestName} just RSVPed to ${eventTitle}`;
  const statusLabel = isRequest ? 'Request to join' : guestStatus.toUpperCase();

  try {
    await resend.emails.send({
      from: 'INVY <noreply@invy.rsvp>', // TODO: Update with your verified domain
      to: organizerEmail,
      subject,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #000; font-size: 22px; margin-bottom: 16px;">${isRequest ? 'New request' : 'New RSVP'} for ${eventTitle}</h1>
            <p style="margin: 0 0 12px;">${guestName} — <strong>${statusLabel}</strong>${guestPlusOne > 0 ? ` with +${guestPlusOne}` : ''}.</p>
            <p style="margin: 0 0 12px;">Contact: <strong>${guestContact}</strong></p>

            <div style="margin: 24px 0;">
              <a href="${manageUrl}" style="display: inline-block; padding: 12px 18px; background: #000; color: #fff; text-decoration: none; border-radius: 6px;">Manage RSVPs</a>
              <a href="${publicUrl}" style="display: inline-block; padding: 12px 18px; margin-left: 8px; border: 1px solid #000; color: #000; text-decoration: none; border-radius: 6px;">View Event</a>
            </div>

            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              Questions? Email us at <a href="mailto:contact@invy.rsvp" style="color: #0070f3;">contact@invy.rsvp</a>.
            </p>
${footerHtml}
          </body>
        </html>
      `,
      text: `
New RSVP for ${eventTitle}

${guestName} responded ${guestStatus.toUpperCase()}${guestPlusOne > 0 ? ` with +${guestPlusOne}` : ''}.
Contact: ${guestContact}

Manage RSVPs: ${manageUrl}
View event: ${publicUrl}

Questions? Email us at contact@invy.rsvp.${footerText}
      `.trim(),
    });

    // Log successful send
    await logEmailSent(
      organizerEmail,
      subject,
      eventId
    );
  } catch (error) {
    console.error('Failed to send organizer RSVP email:', error);
    // Log failed send
    await logEmailFailed(
      organizerEmail,
      subject,
      error instanceof Error ? error.message : 'Unknown error',
      eventId
    );
    throw error;
  }
}

export interface RequestReceivedEmailData {
  guestEmail: string;
  guestName: string;
  eventTitle: string;
  eventId?: string;
  hideBranding?: boolean;
}

export interface RequestApprovedEmailData {
  guestEmail: string;
  guestName: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  eventUrl: string;
  eventId?: string;
  eventSlug?: string;
  hideBranding?: boolean;
  privateNote?: string | null;
  approvalToken?: string;
}

export interface RequestDeclinedEmailData {
  guestEmail: string;
  guestName: string;
  eventTitle: string;
  eventId?: string;
  hideBranding?: boolean;
}

export async function sendRequestReceivedEmail(data: RequestReceivedEmailData) {
  const { guestEmail, guestName, eventTitle, eventId, hideBranding } = data;
  const footerHtml = hideBranding ? '' : INVY_FOOTER_HTML;
  const footerText = hideBranding ? '' : INVY_FOOTER_TEXT;

  try {
    await resend.emails.send({
      from: 'INVY <noreply@invy.rsvp>',
      to: guestEmail,
      subject: 'Your request was received',
      html: `
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #000; font-size: 24px; margin-bottom: 20px;">Your request was received</h1>
            <p>Hi ${guestName},</p>
            <p>We received your request for <strong>${eventTitle}</strong>. The organizer will review it and confirm if you're approved.</p>
            <p style="margin-top: 24px; font-size: 14px; color: #666;">You'll receive a confirmation email if approved.</p>
${footerHtml}
          </body>
        </html>
      `,
      text: `Hi ${guestName},\n\nWe received your request for ${eventTitle}. The organizer will review it and confirm if you're approved.\n\nYou'll receive a confirmation email if approved.${footerText}`.trim(),
    });
    await logEmailSent(guestEmail, 'Your request was received', eventId);
  } catch (error) {
    console.error('Failed to send request received email:', error);
    await logEmailFailed(guestEmail, 'Your request was received', error instanceof Error ? error.message : 'Unknown error', eventId);
    throw error;
  }
}

export async function sendRequestApprovedEmail(data: RequestApprovedEmailData) {
  const { guestEmail, guestName, eventTitle, eventDate, eventLocation, eventUrl, eventId, eventSlug, hideBranding, privateNote, approvalToken } = data;
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://invy.rsvp';
  const viewUrl = approvalToken && eventSlug ? `${APP_URL}/api/events/${eventSlug}/approve?token=${approvalToken}` : eventUrl;
  const footerHtml = hideBranding ? '' : INVY_FOOTER_HTML;
  const footerText = hideBranding ? '' : INVY_FOOTER_TEXT;

  const date = new Date(eventDate);
  const formattedDate = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const formattedTime = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  try {
    await resend.emails.send({
      from: 'INVY <noreply@invy.rsvp>',
      to: guestEmail,
      subject: `You're confirmed for ${eventTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #000; font-size: 24px; margin-bottom: 20px;">You're confirmed</h1>
            <p>Hi ${guestName},</p>
            <p>You're confirmed for <strong>${eventTitle}</strong>.</p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Date:</strong> ${formattedDate}</p>
              <p style="margin: 4px 0 0;"><strong>Time:</strong> ${formattedTime}</p>
              <p style="margin: 4px 0 0;"><strong>Location:</strong> ${eventLocation}</p>
            </div>
            ${privateNote ? `<div style="background: #f9f9f9; padding: 16px; border-radius: 8px; margin: 16px 0; font-size: 14px;">${privateNote.replace(/\n/g, '<br>')}</div>` : ''}
            <p style="margin: 20px 0;"><a href="${viewUrl}" style="color: #0070f3;">View event details</a></p>
${footerHtml}
          </body>
        </html>
      `,
      text: `Hi ${guestName},\n\nYou're confirmed for ${eventTitle}.\n\nDate: ${formattedDate}\nTime: ${formattedTime}\nLocation: ${eventLocation}\n${privateNote ? `\n${privateNote}\n` : ''}\nView event details: ${viewUrl}${footerText}`.trim(),
    });
    await logEmailSent(guestEmail, `You're confirmed for ${eventTitle}`, eventId);
  } catch (error) {
    console.error('Failed to send approval email:', error);
    await logEmailFailed(guestEmail, `You're confirmed for ${eventTitle}`, error instanceof Error ? error.message : 'Unknown error', eventId);
    throw error;
  }
}

export async function sendRequestDeclinedEmail(data: RequestDeclinedEmailData) {
  const { guestEmail, guestName, eventTitle, eventId, hideBranding } = data;
  const footerHtml = hideBranding ? '' : INVY_FOOTER_HTML;
  const footerText = hideBranding ? '' : INVY_FOOTER_TEXT;

  try {
    await resend.emails.send({
      from: 'INVY <noreply@invy.rsvp>',
      to: guestEmail,
      subject: `Update on your request for ${eventTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #000; font-size: 24px; margin-bottom: 20px;">Update on your request</h1>
            <p>Hi ${guestName},</p>
            <p>The organizer is unable to confirm your request for <strong>${eventTitle}</strong>.</p>
            <p style="margin-top: 24px; font-size: 14px; color: #666;">Thanks for your interest.</p>
${footerHtml}
          </body>
        </html>
      `,
      text: `Hi ${guestName},\n\nThe organizer is unable to confirm your request for ${eventTitle}.\n\nThanks for your interest.${footerText}`.trim(),
    });
    await logEmailSent(guestEmail, `Update on your request for ${eventTitle}`, eventId);
  } catch (error) {
    console.error('Failed to send decline email:', error);
    await logEmailFailed(guestEmail, `Update on your request for ${eventTitle}`, error instanceof Error ? error.message : 'Unknown error', eventId);
    throw error;
  }
}

export interface ReminderEmailData {
  guestEmail: string;
  guestName: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventUrl: string;
  eventId?: string;
  hideBranding?: boolean;
}

export async function sendReminderEmail(data: ReminderEmailData) {
  const { guestEmail, guestName, eventTitle, eventDate, eventTime, eventLocation, eventUrl, eventId, hideBranding } = data;
  const footerHtml = hideBranding ? '' : INVY_FOOTER_HTML;
  const footerText = hideBranding ? '' : INVY_FOOTER_TEXT;

  try {
    await resend.emails.send({
      from: 'INVY <noreply@invy.rsvp>',
      to: guestEmail,
      subject: `Reminder: ${eventTitle} is tomorrow!`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #000; font-size: 24px; margin-bottom: 20px;">Reminder: ${eventTitle}</h1>
            <p>Hi ${guestName},</p>
            <p>This is a friendly reminder that <strong>${eventTitle}</strong> is coming up soon.</p>

            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Date:</strong> ${eventDate}</p>
              <p style="margin: 4px 0 0;"><strong>Time:</strong> ${eventTime}</p>
              <p style="margin: 4px 0 0;"><strong>Location:</strong> ${eventLocation}</p>
            </div>

            <p style="margin: 20px 0;">
              <a href="${eventUrl}" style="display: inline-block; padding: 12px 18px; background: #000; color: #fff; text-decoration: none; border-radius: 6px;">View event details</a>
            </p>
${footerHtml}
          </body>
        </html>
      `,
      text: `
Reminder: ${eventTitle}

Hi ${guestName},

This is a friendly reminder that ${eventTitle} is coming up soon.

Date: ${eventDate}
Time: ${eventTime}
Location: ${eventLocation}

View event details: ${eventUrl}${footerText}
      `.trim(),
    });

    await logEmailSent(guestEmail, `Reminder: ${eventTitle} is tomorrow!`, eventId);
  } catch (error) {
    console.error('Failed to send reminder email:', error);
    await logEmailFailed(
      guestEmail,
      `Reminder: ${eventTitle} is tomorrow!`,
      error instanceof Error ? error.message : 'Unknown error',
      eventId
    );
    throw error;
  }
}

