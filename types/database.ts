/**
 * Database types for INVY
 * These match the Supabase schema
 */

export type PlanTier = 'free' | 'pro' | 'business';
export type RSVPStatus = 'yes' | 'no' | 'maybe';
export type Theme = 'light' | 'dark';
export type GuestListVisibility = 'host_only' | 'public' | 'attendees_only';

export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  plan_tier: PlanTier;
}

export interface Event {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  starts_at: string; // ISO timestamp
  location_text: string;
  location_url: string | null;
  organizer_email: string;
  theme: Theme;
  admin_secret: string;
  owner_user_id: string | null;
  created_at: string;
  updated_at: string;
  // Future-ready fields
  capacity_limit: number | null;
  guest_list_visibility: GuestListVisibility;
  plan_tier: PlanTier;
}

export interface RSVP {
  id: string;
  event_id: string;
  name: string;
  contact_info: string;
  status: RSVPStatus;
  plus_one: number;
  created_at: string;
}

// Input types for creating/updating
export interface CreateEventInput {
  title: string;
  description?: string;
  starts_at: string; // ISO timestamp
  location_text: string;
  location_url?: string;
  organizer_email: string;
  theme?: Theme;
}

export interface UpdateEventInput {
  title?: string;
  description?: string;
  starts_at?: string;
  location_text?: string;
  location_url?: string;
  theme?: Theme;
}

export interface CreateRsvpInput {
  name: string;
  contact_info: string;
  status: RSVPStatus;
  plus_one?: number;
}

