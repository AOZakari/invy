/**
 * Database types for INVY
 * These match the Supabase schema
 */

export type PlanTier = 'free' | 'pro' | 'business';
export type RSVPStatus = 'yes' | 'no' | 'maybe' | 'pending' | 'approved' | 'declined';
export type RsvpMode = 'instant' | 'request';
export type Theme = 'light' | 'dark' | 'ocean' | 'forest' | 'sunset' | 'midnight' | 'rose' | 'lavender';
export type PageStyle = 'classic' | 'modern' | 'bold';
export type CoverImagePosition = 'top' | 'center' | 'bottom';
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
  ends_at: string | null;
  location_text: string;
  location_url: string | null;
  organizer_email: string;
  theme: Theme;
  admin_secret: string;
  owner_user_id: string | null;
  notify_on_rsvp: boolean;
  rsvp_deadline: string | null;
  rsvp_open: boolean;
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
  og_image_url: string | null;
  page_style: PageStyle;
  cover_image_url: string | null;
  poster_image_url: string | null;
  cover_image_position: CoverImagePosition;
  custom_share_message: string | null; // Business only
  hide_branding_in_share: boolean; // Business only
  send_reminder_1_day: boolean; // Business only
  reminder_sent_at: string | null; // When reminder was sent
  hide_branding: boolean; // Business only - hide "Powered by INVY"
  keep_live: boolean; // Keep purchase: event stays live, no Pro features
  rsvp_mode: RsvpMode;
  hide_location_until_approved: boolean;
  hide_private_note_until_approved: boolean;
  private_note: string | null;
  // Organizer contact section (Pro/Hub)
  show_organizer_contact: boolean;
  organizer_contact_email: string | null;
  organizer_contact_phone: string | null;
  organizer_contact_instagram: string | null;
  organizer_contact_whatsapp: string | null;
  organizer_contact_text: string | null;
}

export interface RSVP {
  id: string;
  event_id: string;
  name: string;
  contact_info: string;
  status: RSVPStatus;
  plus_one: number;
  created_at: string;
  custom_field_values?: Record<string, string | number | boolean>;
}

// Input types for creating/updating
export interface CreateEventInput {
  title: string;
  description?: string;
  starts_at: string; // ISO timestamp
  ends_at?: string | null;
  location_text: string;
  location_url?: string;
  organizer_email: string;
  theme?: Theme;
  notify_on_rsvp?: boolean;
  capacity_limit?: number | null;
  rsvp_deadline?: string | null;
  slug?: string; // Custom slug (Pro+ only)
}

export interface UpdateEventInput {
  title?: string;
  description?: string;
  starts_at?: string;
  ends_at?: string | null;
  location_text?: string;
  location_url?: string;
  theme?: Theme;
  notify_on_rsvp?: boolean;
  capacity_limit?: number | null;
  rsvp_deadline?: string | null;
  rsvp_open?: boolean;
  guest_list_visibility?: GuestListVisibility;
  slug?: string; // Custom slug (Pro+ only)
  og_image_url?: string | null; // Custom OG image (Pro+ only)
  page_style?: PageStyle; // Pro+ only
  cover_image_url?: string | null; // Pro+ only
  poster_image_url?: string | null; // Pro+ only
  cover_image_position?: CoverImagePosition; // Pro+ only
  custom_rsvp_fields?: CustomRsvpField[]; // Pro+ only
  custom_share_message?: string | null; // Business only
  hide_branding_in_share?: boolean; // Business only
  send_reminder_1_day?: boolean; // Business only
  hide_branding?: boolean; // Business only
  rsvp_mode?: RsvpMode; // Pro+ only
  hide_location_until_approved?: boolean; // Pro+ only, request mode
  hide_private_note_until_approved?: boolean; // Pro+ only, request mode
  private_note?: string | null; // Pro+ only
  show_organizer_contact?: boolean; // Pro+ only
  organizer_contact_email?: string | null;
  organizer_contact_phone?: string | null;
  organizer_contact_instagram?: string | null;
  organizer_contact_whatsapp?: string | null;
  organizer_contact_text?: string | null;
}

export interface CreateRsvpInput {
  name?: string; // optional for MVP
  contact_info: string; // email, required
  status: RSVPStatus;
  plus_one?: number;
  custom_fields?: Record<string, string | number | boolean>; // Answers to custom RSVP fields
  custom_field_values?: Record<string, string | number | boolean>; // Alias for API
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

// Pricing constants (legacy Pro/Business)
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

// MVP product tiers (scaffolding)
// Note: Plus uses Stripe tier 'keep' for API compatibility
export const MVP_PRICING = {
  plus: { price: 2.99, label: 'Plus', per: 'event', stripeTier: 'keep' as const },
  proEvent: { price: 5.99, label: 'Pro Event', per: 'event' },
  organizerHub: { price: 15.99, label: 'Organizer Hub', per: 'month' },
} as const;

