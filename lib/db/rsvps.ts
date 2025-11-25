import { supabaseAdmin } from '@/lib/supabase/server';
import type { RSVP, CreateRsvpInput } from '@/types/database';

/**
 * Create a new RSVP for an event
 */
export async function createRsvp(eventId: string, input: CreateRsvpInput): Promise<RSVP> {
  const { data, error } = await supabaseAdmin
    .from('rsvps')
    .insert({
      event_id: eventId,
      name: input.name,
      contact_info: input.contact_info,
      status: input.status,
      plus_one: input.plus_one || 0,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create RSVP: ${error.message}`);
  }

  return data as RSVP;
}

/**
 * Get all RSVPs for an event
 * Ordered by created_at (newest first)
 */
export async function getRsvpsForEvent(eventId: string): Promise<RSVP[]> {
  const { data, error } = await supabaseAdmin
    .from('rsvps')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch RSVPs: ${error.message}`);
  }

  return (data || []) as RSVP[];
}

/**
 * Get RSVP statistics for an event
 */
export interface RsvpStats {
  total: number;
  yes: number;
  no: number;
  maybe: number;
  estimatedGuests: number; // Includes +1s
}

export async function getRsvpStatsForEvent(eventId: string): Promise<RsvpStats> {
  const rsvps = await getRsvpsForEvent(eventId);

  const stats: RsvpStats = {
    total: rsvps.length,
    yes: 0,
    no: 0,
    maybe: 0,
    estimatedGuests: 0,
  };

  rsvps.forEach((rsvp) => {
    stats[rsvp.status]++;
    if (rsvp.status === 'yes') {
      stats.estimatedGuests += 1 + rsvp.plus_one;
    } else if (rsvp.status === 'maybe') {
      // Count maybe as 0.5 + half of their +1s (conservative estimate)
      stats.estimatedGuests += 0.5 + rsvp.plus_one * 0.5;
    }
  });

  // Round estimated guests
  stats.estimatedGuests = Math.round(stats.estimatedGuests);

  return stats;
}

/**
 * Delete an RSVP (admin only)
 */
export async function deleteRsvp(rsvpId: string): Promise<void> {
  const { error } = await supabaseAdmin.from('rsvps').delete().eq('id', rsvpId);

  if (error) {
    throw new Error(`Failed to delete RSVP: ${error.message}`);
  }
}

