/**
 * Error logging utilities
 * Logs errors to the database for admin review
 */

import { supabaseAdmin } from '@/lib/supabase/server';
import type { LogLevel } from '@/types/database';

export interface LogContext {
  [key: string]: any;
}

/**
 * Log an error to the database
 */
export async function logError(
  level: LogLevel,
  message: string,
  context?: LogContext,
  userId?: string,
  eventId?: string
): Promise<void> {
  try {
    await supabaseAdmin.from('error_logs').insert({
      level,
      message,
      context: context || null,
      user_id: userId || null,
      event_id: eventId || null,
    });
  } catch (err) {
    // Don't throw - logging failures shouldn't break the app
    console.error('Failed to log error:', err);
  }
}

/**
 * Log an error (convenience function)
 */
export async function logErrorLevel(
  message: string,
  context?: LogContext,
  userId?: string,
  eventId?: string
): Promise<void> {
  return logError('error', message, context, userId, eventId);
}

/**
 * Log a warning
 */
export async function logWarning(
  message: string,
  context?: LogContext,
  userId?: string,
  eventId?: string
): Promise<void> {
  return logError('warn', message, context, userId, eventId);
}

/**
 * Log info
 */
export async function logInfo(
  message: string,
  context?: LogContext,
  userId?: string,
  eventId?: string
): Promise<void> {
  return logError('info', message, context, userId, eventId);
}

