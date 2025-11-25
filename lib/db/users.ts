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
 * Get or create user by email
 * For Phase 6+ auth integration
 */
export async function getOrCreateUserByEmail(email: string, userId?: string): Promise<User> {
  // If userId provided, try to get existing user
  if (userId) {
    const user = await getUserById(userId);
    if (user) return user;
  }

  // Try to find by email
  const { data: existing } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (existing) {
    return existing as User;
  }

  // Create new user
  const { data, error } = await supabaseAdmin
    .from('users')
    .insert({
      email,
      id: userId, // Use Supabase auth user ID if provided
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create user: ${error.message}`);
  }

  return data as User;
}

