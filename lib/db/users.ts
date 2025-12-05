import { supabaseAdmin } from '@/lib/supabase/server';
import type { User } from '@/types/database';

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch user: ${error.message}`);
  }

  return data as User;
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch user: ${error.message}`);
  }

  return data as User;
}

/**
 * Get or create user by email
 * For Phase 6+ auth integration
 * Automatically sets super-admin role for zak@aozakari.com
 */
export async function getOrCreateUserByEmail(email: string, userId?: string): Promise<User> {
  // If userId provided, try to get existing user
  if (userId) {
    const user = await getUserById(userId);
    if (user) {
      // Ensure super-admin role is set if needed
      if (email === 'zak@aozakari.com' && user.role !== 'superadmin') {
        const { data: updated } = await supabaseAdmin
          .from('users')
          .update({ role: 'superadmin' })
          .eq('id', userId)
          .select()
          .single();
        return (updated || user) as User;
      }
      return user;
    }
  }

  // Try to find by email
  const { data: existing } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (existing) {
    // Ensure super-admin role is set if needed
    if (email === 'zak@aozakari.com' && existing.role !== 'superadmin') {
      const { data: updated } = await supabaseAdmin
        .from('users')
        .update({ role: 'superadmin' })
        .eq('id', existing.id)
        .select()
        .single();
      return (updated || existing) as User;
    }
    return existing as User;
  }

  // Create new user
  const role = email === 'zak@aozakari.com' ? 'superadmin' : 'user';
  const { data, error } = await supabaseAdmin
    .from('users')
    .insert({
      email,
      id: userId, // Use Supabase auth user ID if provided
      role,
      plan_tier: 'free',
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create user: ${error.message}`);
  }

  return data as User;
}

/**
 * Update user plan tier
 */
export async function updateUserPlanTier(
  userId: string,
  planTier: 'free' | 'pro' | 'business'
): Promise<User> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .update({ plan_tier: planTier })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update user plan: ${error.message}`);
  }

  return data as User;
}

/**
 * Update user role (super-admin only)
 */
export async function updateUserRole(
  userId: string,
  role: 'user' | 'superadmin'
): Promise<User> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .update({ role })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update user role: ${error.message}`);
  }

  return data as User;
}

