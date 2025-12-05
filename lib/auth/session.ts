/**
 * Session management utilities
 * Handles Supabase Auth session retrieval
 */

import { supabaseServer } from '@/lib/supabase/server';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export interface Session {
  user: SupabaseUser;
  access_token: string;
}

/**
 * Get current session from Supabase Auth
 */
export async function getSession(): Promise<Session | null> {
  const {
    data: { session },
    error,
  } = await supabaseServer.auth.getSession();

  if (error || !session) {
    return null;
  }

  return {
    user: session.user,
    access_token: session.access_token,
  };
}

/**
 * Get current user from session
 */
export async function getCurrentUser(): Promise<SupabaseUser | null> {
  const session = await getSession();
  return session?.user ?? null;
}

/**
 * Require authentication, throw if not authenticated
 */
export async function requireAuth(): Promise<Session> {
  const session = await getSession();
  if (!session) {
    throw new Error('Authentication required');
  }
  return session;
}

