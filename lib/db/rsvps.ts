import { supabaseAdmin } from '@/lib/supabase/server';
import { getExactOccupancy } from '@/lib/db/capacity';
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
      custom_field_values: input.custom_fields || input.custom_field_values || {},
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
  pending: number;
  approved: number;
  declined: number;
  estimatedGuests: number; // Includes +1s
}

export async function getRsvpStatsForEvent(eventId: string): Promise<RsvpStats> {
  const rsvps = await getRsvpsForEvent(eventId);

  const stats: RsvpStats = {
    total: rsvps.length,
    yes: 0,
    no: 0,
    maybe: 0,
    pending: 0,
    approved: 0,
    declined: 0,
    estimatedGuests: 0,
  };

  rsvps.forEach((rsvp) => {
    const k = rsvp.status as keyof RsvpStats;
    if (k in stats && typeof stats[k] === 'number') {
      (stats[k] as number)++;
    }
  });

  // Use shared occupancy logic; round for display
  stats.estimatedGuests = Math.round(getExactOccupancy(rsvps));

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

/**
 * Update RSVP status (for request-to-attend: approve/decline)
 */
export async function updateRsvpStatus(
  rsvpId: string,
  status: 'approved' | 'declined'
): Promise<RSVP | null> {
  const { data, error } = await supabaseAdmin
    .from('rsvps')
    .update({ status })
    .eq('id', rsvpId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update RSVP: ${error.message}`);
  }

  return data as RSVP;
}

/**
 * Bulk update RSVP statuses
 */
export async function bulkUpdateRsvpStatus(
  rsvpIds: string[],
  status: 'approved' | 'declined'
): Promise<number> {
  if (rsvpIds.length === 0) return 0;

  const { data, error } = await supabaseAdmin
    .from('rsvps')
    .update({ status })
    .in('id', rsvpIds)
    .select('id');

  if (error) {
    throw new Error(`Failed to bulk update RSVPs: ${error.message}`);
  }

  return data?.length ?? 0;
}

