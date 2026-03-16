/**
 * Capacity enforcement helpers
 * Single source of truth for occupancy calculation.
 * Used for both enforcement (exact) and display (via getRsvpStatsForEvent).
 */

import { supabaseAdmin } from '@/lib/supabase/server';
import type { RSVP, RSVPStatus } from '@/types/database';

/**
 * Contribution of a single RSVP toward capacity.
 * yes / approved => 1 + plus_one
 * maybe => 0.5 + plus_one * 0.5
 * pending / no / declined => 0
 */
export function getContribution(status: RSVPStatus, plusOne: number): number {
  const p = plusOne ?? 0;
  if (status === 'yes' || status === 'approved') {
    return 1 + p;
  }
  if (status === 'maybe') {
    return 0.5 + p * 0.5;
  }
  return 0;
}

/**
 * Exact occupancy from RSVP records (no rounding).
 * Use this for capacity enforcement, not display stats.
 */
export function getExactOccupancy(rsvps: { status: string; plus_one?: number }[]): number {
  return rsvps.reduce((sum, r) => sum + getContribution(r.status as RSVPStatus, r.plus_one ?? 0), 0);
}

/** Error message when capacity is exceeded */
export const CAPACITY_EXCEEDED_MESSAGE = 'This event is fully booked. No spots remaining.';

/**
 * Atomic RSVP create with capacity check.
 * Uses FOR UPDATE lock on event; exact occupancy; no rounding.
 * Use when event has capacity_limit. Falls back to plain insert when no limit.
 */
export async function createRsvpWithCapacityCheck(
  eventId: string,
  input: {
    name: string;
    contact_info: string;
    status: RSVPStatus;
    plus_one?: number;
    custom_field_values?: Record<string, string | number | boolean>;
  }
): Promise<RSVP> {
  const { data, error } = await supabaseAdmin.rpc('create_rsvp_with_capacity_check', {
    p_event_id: eventId,
    p_name: input.name,
    p_contact_info: input.contact_info,
    p_status: input.status,
    p_plus_one: input.plus_one ?? 0,
    p_custom_field_values: input.custom_field_values ?? {},
  });

  if (error) {
    if (error.message?.includes('fully booked') || error.code === 'P0001') {
      throw new Error(CAPACITY_EXCEEDED_MESSAGE);
    }
    throw new Error(`Failed to create RSVP: ${error.message}`);
  }

  return data as unknown as RSVP;
}

/**
 * Atomic approve/decline with capacity check for approve.
 * Uses FOR UPDATE lock on event; exact occupancy.
 */
export async function approveRsvpsWithCapacityCheck(
  adminSecret: string,
  eventId: string,
  rsvpIds: string[],
  status: 'approved' | 'declined'
): Promise<number> {
  const { data, error } = await supabaseAdmin.rpc('approve_rsvps_with_capacity_check', {
    p_admin_secret: adminSecret,
    p_event_id: eventId,
    p_rsvp_ids: rsvpIds,
    p_status: status,
  });

  if (error) {
    if (error.message?.includes('exceed capacity') || error.code === 'P0001') {
      throw new Error('Approving would exceed capacity limit.');
    }
    if (error.message?.includes('Invalid manage link')) {
      throw new Error('Invalid manage link');
    }
    throw new Error(`Failed to update RSVPs: ${error.message}`);
  }

  return (data as number) ?? 0;
}
