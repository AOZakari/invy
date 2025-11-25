import { supabaseAdmin } from '@/lib/supabase/server';
import { generateSlug } from '@/lib/utils/slug';
import { generateAdminSecret } from '@/lib/utils/secrets';
import type { Event, CreateEventInput, UpdateEventInput } from '@/types/database';

/**
 * Create a new event
 * Generates slug and admin_secret automatically
 */
export async function createEvent(input: CreateEventInput): Promise<Event> {
  // Generate unique slug (retry if collision)
  let slug = generateSlug();
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const { data: existing } = await supabaseAdmin
      .from('events')
      .select('id')
      .eq('slug', slug)
      .single();

    if (!existing) {
      break; // Slug is available
    }

    slug = generateSlug();
    attempts++;
  }

  if (attempts >= maxAttempts) {
    throw new Error('Failed to generate unique slug after multiple attempts');
  }

  // Generate admin secret
  const adminSecret = generateAdminSecret();

  // Insert event
  const { data, error } = await supabaseAdmin
    .from('events')
    .insert({
      slug,
      title: input.title,
      description: input.description || null,
      starts_at: input.starts_at,
      location_text: input.location_text,
      location_url: input.location_url || null,
      organizer_email: input.organizer_email,
      theme: input.theme || 'light',
      admin_secret: adminSecret,
      owner_user_id: null, // Anonymous creation
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create event: ${error.message}`);
  }

  return data as Event;
}

/**
 * Get event by slug (public access)
 */
export async function getEventBySlug(slug: string): Promise<Event | null> {
  const { data, error } = await supabaseAdmin
    .from('events')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    throw new Error(`Failed to fetch event: ${error.message}`);
  }

  return data as Event;
}

/**
 * Get event by admin secret (for admin access)
 * Returns event without exposing admin_secret in response
 */
export async function getEventByAdminSecret(adminSecret: string): Promise<Event | null> {
  const { data, error } = await supabaseAdmin
    .from('events')
    .select('*')
    .eq('admin_secret', adminSecret)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch event: ${error.message}`);
  }

  return data as Event;
}

/**
 * Update event (requires admin secret verification)
 */
export async function updateEvent(
  eventId: string,
  input: UpdateEventInput,
  adminSecret?: string
): Promise<Event> {
  // If admin secret provided, verify it matches
  if (adminSecret) {
    const event = await getEventByAdminSecret(adminSecret);
    if (!event || event.id !== eventId) {
      throw new Error('Invalid admin secret');
    }
  }

  // Build update object (only include provided fields)
  const updateData: Partial<Event> = {};

  if (input.title !== undefined) updateData.title = input.title;
  if (input.description !== undefined) updateData.description = input.description || null;
  if (input.starts_at !== undefined) updateData.starts_at = input.starts_at;
  if (input.location_text !== undefined) updateData.location_text = input.location_text;
  if (input.location_url !== undefined) updateData.location_url = input.location_url || null;
  if (input.theme !== undefined) updateData.theme = input.theme;

  const { data, error } = await supabaseAdmin
    .from('events')
    .update(updateData)
    .eq('id', eventId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update event: ${error.message}`);
  }

  return data as Event;
}

/**
 * Get all events for a user (by owner_user_id)
 * For Phase 6+ dashboard
 */
export async function getEventsByUserId(userId: string): Promise<Event[]> {
  const { data, error } = await supabaseAdmin
    .from('events')
    .select('*')
    .eq('owner_user_id', userId)
    .order('starts_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch events: ${error.message}`);
  }

  return (data || []) as Event[];
}

/**
 * Get events by organizer email (for claiming)
 * For Phase 6+ dashboard
 */
export async function getEventsByOrganizerEmail(email: string): Promise<Event[]> {
  const { data, error } = await supabaseAdmin
    .from('events')
    .select('*')
    .eq('organizer_email', email)
    .is('owner_user_id', null) // Only unclaimed events
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch events: ${error.message}`);
  }

  return (data || []) as Event[];
}

/**
 * Claim an event (link it to a user)
 * For Phase 6+ dashboard
 */
export async function claimEvent(eventId: string, userId: string): Promise<Event> {
  const { data, error } = await supabaseAdmin
    .from('events')
    .update({ owner_user_id: userId })
    .eq('id', eventId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to claim event: ${error.message}`);
  }

  return data as Event;
}

