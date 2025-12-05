/**
 * User management utilities
 * Handles user record creation and retrieval
 */

import { supabaseAdmin } from '@/lib/supabase/server';
import { getOrCreateUserByEmail } from '@/lib/db/users';
import type { User } from '@/types/database';
import type { User as SupabaseUser } from '@supabase/supabase-js';

/**
 * Get or create user record from Supabase Auth user
 * Links Supabase Auth user to our users table
 */
export async function getOrCreateUserFromAuth(
  authUser: SupabaseUser
): Promise<User> {
  const email = authUser.email;
  if (!email) {
    throw new Error('User email is required');
  }

  // Get or create user record
  const user = await getOrCreateUserByEmail(email, authUser.id);

  // If this is the super-admin email, ensure role is set
  if (email === 'zak@aozakari.com' && user.role !== 'superadmin') {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ role: 'superadmin' })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Failed to set super-admin role:', error);
    } else {
      return data as User;
    }
  }

  return user;
}

/**
 * Get user record from Supabase Auth session
 */
export async function getUserFromSession(): Promise<User | null> {
  const { supabaseServer } = await import('@/lib/supabase/server');
  const {
    data: { session },
  } = await supabaseServer.auth.getSession();

  if (!session?.user) {
    return null;
  }

  const email = session.user.email;
  if (!email) {
    return null;
  }

  // Get user from our users table
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (error || !data) {
    // User doesn't exist in our table yet, create it
    return await getOrCreateUserFromAuth(session.user);
  }

  // Ensure super-admin role is set if needed
  if (email === 'zak@aozakari.com' && data.role !== 'superadmin') {
    const { data: updated } = await supabaseAdmin
      .from('users')
      .update({ role: 'superadmin' })
      .eq('id', data.id)
      .select()
      .single();

    return (updated || data) as User;
  }

  return data as User;
}

