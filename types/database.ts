/**
 * Database types for INVY
 * These match the Supabase schema
 */

export type PlanTier = 'free' | 'pro' | 'business';
export type RSVPStatus = 'yes' | 'no' | 'maybe';
export type Theme = 'light' | 'dark' | 'ocean' | 'forest' | 'sunset' | 'midnight' | 'rose' | 'lavender';
export type GuestListVisibility = 'host_only' | 'public' | 'attendees_only';
export type UserRole = 'user' | 'superadmin';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | null;
export type LogLevel = 'error' | 'warn' | 'info';
export type EmailStatus = 'sent' | 'failed' | 'bounced';

export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  plan_tier: PlanTier;
  role: UserRole;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: SubscriptionStatus;
}

export interface CustomRsvpField {
  id: string;
  label: string;
  type: 'text' | 'select' | 'checkbox' | 'number';
  required: boolean;
  options?: string[]; // For select/checkbox types
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
  notify_on_rsvp: boolean;
  created_at: string;
  updated_at: string;
  // Future-ready fields
  capacity_limit: number | null;
  guest_list_visibility: GuestListVisibility;
  plan_tier: PlanTier;
  // Upgrade tracking
  stripe_subscription_item_id: string | null;
  upgraded_at: string | null;
  upgraded_by_user_id: string | null;
  // Custom RSVP fields
  custom_rsvp_fields: CustomRsvpField[];
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
  notify_on_rsvp?: boolean;
}

export interface UpdateEventInput {
  title?: string;
  description?: string;
  starts_at?: string;
  location_text?: string;
  location_url?: string;
  theme?: Theme;
  notify_on_rsvp?: boolean;
}

export interface CreateRsvpInput {
  name: string;
  contact_info: string;
  status: RSVPStatus;
  plus_one?: number;
  custom_fields?: Record<string, string | number | boolean>; // Answers to custom RSVP fields
}

// Logging types
export interface ErrorLog {
  id: string;
  level: LogLevel;
  message: string;
  context: Record<string, any> | null;
  user_id: string | null;
  event_id: string | null;
  created_at: string;
}

export interface EmailLog {
  id: string;
  to_email: string;
  subject: string;
  status: EmailStatus;
  error_message: string | null;
  event_id: string | null;
  user_id: string | null;
  created_at: string;
}

// Pricing constants
export const PRICING = {
  pro: {
    monthly: 9,
    yearly: 90, // ~17% discount
  },
  business: {
    monthly: 29,
    yearly: 290, // ~17% discount
  },
} as const;

