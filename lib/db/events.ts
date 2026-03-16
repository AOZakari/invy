import { supabaseAdmin } from '@/lib/supabase/server';
import { generateSlug, isValidSlug } from '@/lib/utils/slug';
import { generateAdminSecret } from '@/lib/utils/secrets';
import type { Event, CreateEventInput, UpdateEventInput } from '@/types/database';

/**
 * Create a new event
 * Generates slug and admin_secret automatically (or uses custom slug if provided and valid)
 */
export async function createEvent(input: CreateEventInput): Promise<Event> {
  let slug: string;
  if (input.slug?.trim() && isValidSlug(input.slug.trim().toLowerCase())) {
    const customSlug = input.slug.trim().toLowerCase();
    const { data: existing } = await supabaseAdmin
      .from('events')
      .select('id')
      .eq('slug', customSlug)
      .single();
    if (existing) {
      throw new Error('This URL is already taken. Please choose another.');
    }
    slug = customSlug;
  } else {
    let attempts = 0;
    const maxAttempts = 10;
    slug = generateSlug();

    while (attempts < maxAttempts) {
      const { data: existing } = await supabaseAdmin
        .from('events')
        .select('id')
        .eq('slug', slug)
        .single();

      if (!existing) break;

      slug = generateSlug();
      attempts++;
    }

    if (attempts >= maxAttempts) {
      throw new Error('Failed to generate unique slug after multiple attempts');
    }
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
      ends_at: input.ends_at ?? null,
      location_text: input.location_text,
      location_url: input.location_url || null,
      organizer_email: input.organizer_email,
      theme: input.theme || 'light',
      notify_on_rsvp: input.notify_on_rsvp ?? true,
      admin_secret: adminSecret,
      owner_user_id: null,
      custom_rsvp_fields: [],
      capacity_limit: input.capacity_limit ?? null,
      rsvp_deadline: input.rsvp_deadline ?? null,
      rsvp_open: true,
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

  // Ensure custom_rsvp_fields is always an array
  const event = data as Event;
  if (!event.custom_rsvp_fields || !Array.isArray(event.custom_rsvp_fields)) {
    event.custom_rsvp_fields = [];
  }

  return event;
}

/**
 * Get event by id
 */
export async function getEventById(id: string): Promise<Event | null> {
  const { data, error } = await supabaseAdmin
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch event: ${error.message}`);
  }

  // Ensure custom_rsvp_fields is always an array
  const event = data as Event;
  if (!event.custom_rsvp_fields || !Array.isArray(event.custom_rsvp_fields)) {
    event.custom_rsvp_fields = [];
  }

  return event;
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

  // Ensure custom_rsvp_fields is always an array
  const event = data as Event;
  if (!event.custom_rsvp_fields || !Array.isArray(event.custom_rsvp_fields)) {
    event.custom_rsvp_fields = [];
  }

  return event;
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
  if (input.ends_at !== undefined) updateData.ends_at = input.ends_at ?? null;
  if (input.location_text !== undefined) updateData.location_text = input.location_text;
  if (input.location_url !== undefined) updateData.location_url = input.location_url || null;
  if (input.theme !== undefined) updateData.theme = input.theme as Event['theme'];
  if (input.notify_on_rsvp !== undefined) updateData.notify_on_rsvp = input.notify_on_rsvp;
  if (input.capacity_limit !== undefined) updateData.capacity_limit = input.capacity_limit ?? null;
  if (input.rsvp_deadline !== undefined) updateData.rsvp_deadline = input.rsvp_deadline ?? null;
  if (input.rsvp_open !== undefined) updateData.rsvp_open = input.rsvp_open;
  if (input.guest_list_visibility !== undefined) updateData.guest_list_visibility = input.guest_list_visibility;
  if (input.og_image_url !== undefined) updateData.og_image_url = input.og_image_url ?? null;
  if (input.page_style !== undefined) updateData.page_style = input.page_style;
  if (input.cover_image_url !== undefined) updateData.cover_image_url = input.cover_image_url ?? null;
  if (input.poster_image_url !== undefined) updateData.poster_image_url = input.poster_image_url ?? null;
  if (input.cover_image_position !== undefined) updateData.cover_image_position = input.cover_image_position;
  if (input.rsvp_mode !== undefined) updateData.rsvp_mode = input.rsvp_mode;
  if (input.hide_location_until_approved !== undefined) updateData.hide_location_until_approved = input.hide_location_until_approved;
  if (input.hide_private_note_until_approved !== undefined) updateData.hide_private_note_until_approved = input.hide_private_note_until_approved;
  if (input.private_note !== undefined) updateData.private_note = input.private_note ?? null;
  if (input.custom_rsvp_fields !== undefined) updateData.custom_rsvp_fields = input.custom_rsvp_fields;
  if (input.custom_share_message !== undefined) updateData.custom_share_message = input.custom_share_message ?? null;
  if (input.hide_branding_in_share !== undefined) updateData.hide_branding_in_share = input.hide_branding_in_share;
  if (input.send_reminder_1_day !== undefined) updateData.send_reminder_1_day = input.send_reminder_1_day;
  if (input.hide_branding !== undefined) updateData.hide_branding = input.hide_branding;
  if (input.show_organizer_contact !== undefined) updateData.show_organizer_contact = input.show_organizer_contact;
  if (input.organizer_contact_email !== undefined) updateData.organizer_contact_email = input.organizer_contact_email ?? null;
  if (input.organizer_contact_phone !== undefined) updateData.organizer_contact_phone = input.organizer_contact_phone ?? null;
  if (input.organizer_contact_instagram !== undefined) updateData.organizer_contact_instagram = input.organizer_contact_instagram ?? null;
  if (input.organizer_contact_whatsapp !== undefined) updateData.organizer_contact_whatsapp = input.organizer_contact_whatsapp ?? null;
  if (input.organizer_contact_text !== undefined) updateData.organizer_contact_text = input.organizer_contact_text ?? null;

  if (input.slug !== undefined) {
    const { data: existing } = await supabaseAdmin
      .from('events')
      .select('id')
      .eq('slug', input.slug)
      .neq('id', eventId)
      .single();
    if (existing) {
      throw new Error('This URL is already taken. Please choose another.');
    }
    updateData.slug = input.slug;
  }

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
 * Get events that need reminder emails (Business only, starting in ~24h)
 */
export async function getEventsForReminders(): Promise<Event[]> {
  const now = new Date();
  const in23h = new Date(now.getTime() + 23 * 60 * 60 * 1000).toISOString();
  const in25h = new Date(now.getTime() + 25 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabaseAdmin
    .from('events')
    .select('*')
    .eq('plan_tier', 'business')
    .eq('send_reminder_1_day', true)
    .is('reminder_sent_at', null)
    .gte('starts_at', in23h)
    .lte('starts_at', in25h);

  if (error) {
    throw new Error(`Failed to fetch events for reminders: ${error.message}`);
  }

  return (data || []) as Event[];
}

/**
 * Mark reminder as sent for an event
 */
export async function markReminderSent(eventId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('events')
    .update({ reminder_sent_at: new Date().toISOString() })
    .eq('id', eventId);

  if (error) {
    throw new Error(`Failed to mark reminder sent: ${error.message}`);
  }
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

/**
 * Delete an event (and cascade RSVPs). Caller must verify admin_secret or ownership.
 */
export async function deleteEvent(eventId: string, adminSecret: string): Promise<void> {
  const event = await getEventByAdminSecret(adminSecret);
  if (!event || event.id !== eventId) {
    throw new Error('Invalid admin secret');
  }

  const { error } = await supabaseAdmin.from('events').delete().eq('id', eventId);

  if (error) {
    throw new Error(`Failed to delete event: ${error.message}`);
  }
}

/**
 * Duplicate an event: same details, new slug and admin_secret, no RSVPs.
 * Returns the new event. Caller must verify admin_secret.
 */
export async function duplicateEvent(eventId: string, adminSecret: string): Promise<Event> {
  const source = await getEventByAdminSecret(adminSecret);
  if (!source || source.id !== eventId) {
    throw new Error('Invalid admin secret');
  }

  let slug = generateSlug();
  let attempts = 0;
  while (attempts < 10) {
    const { data: existing } = await supabaseAdmin
      .from('events')
      .select('id')
      .eq('slug', slug)
      .single();
    if (!existing) break;
    slug = generateSlug();
    attempts++;
  }
  if (attempts >= 10) {
    throw new Error('Failed to generate unique slug');
  }

  const { data, error } = await supabaseAdmin
    .from('events')
    .insert({
      slug,
      title: source.title,
      description: source.description,
      starts_at: source.starts_at,
      ends_at: source.ends_at,
      location_text: source.location_text,
      location_url: source.location_url,
      organizer_email: source.organizer_email,
      theme: source.theme,
      notify_on_rsvp: source.notify_on_rsvp,
      admin_secret: generateAdminSecret(),
      owner_user_id: source.owner_user_id,
      capacity_limit: source.capacity_limit,
      rsvp_deadline: source.rsvp_deadline,
      rsvp_open: true,
      custom_rsvp_fields: source.custom_rsvp_fields || [],
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to duplicate event: ${error.message}`);
  }

  return data as Event;
}

