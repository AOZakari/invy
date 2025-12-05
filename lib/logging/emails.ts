/**
 * Email logging utilities
 * Logs email delivery status to the database
 */

import { supabaseAdmin } from '@/lib/supabase/server';
import type { EmailStatus } from '@/types/database';

/**
 * Log an email send attempt
 */
export async function logEmail(
  toEmail: string,
  subject: string,
  status: EmailStatus,
  errorMessage?: string,
  eventId?: string,
  userId?: string
): Promise<void> {
  try {
    await supabaseAdmin.from('email_logs').insert({
      to_email: toEmail,
      subject,
      status,
      error_message: errorMessage || null,
      event_id: eventId || null,
      user_id: userId || null,
    });
  } catch (err) {
    // Don't throw - logging failures shouldn't break the app
    console.error('Failed to log email:', err);
  }
}

/**
 * Log successful email send
 */
export async function logEmailSent(
  toEmail: string,
  subject: string,
  eventId?: string,
  userId?: string
): Promise<void> {
  return logEmail(toEmail, subject, 'sent', undefined, eventId, userId);
}

/**
 * Log failed email send
 */
export async function logEmailFailed(
  toEmail: string,
  subject: string,
  errorMessage: string,
  eventId?: string,
  userId?: string
): Promise<void> {
  return logEmail(toEmail, subject, 'failed', errorMessage, eventId, userId);
}

/**
 * Log bounced email
 */
export async function logEmailBounced(
  toEmail: string,
  subject: string,
  eventId?: string,
  userId?: string
): Promise<void> {
  return logEmail(toEmail, subject, 'bounced', undefined, eventId, userId);
}

