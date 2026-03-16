-- =============================================================================
-- INVY: All SQL Migrations Combined
-- Run this in your Supabase SQL Editor (e.g. for production)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 001: Initial Schema
-- -----------------------------------------------------------------------------
-- INVY Database Schema

-- Users table (for Phase 6+ auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  plan_tier TEXT DEFAULT 'free' CHECK (plan_tier IN ('free', 'pro', 'business'))
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  location_text TEXT NOT NULL,
  location_url TEXT,
  organizer_email TEXT NOT NULL,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  admin_secret TEXT UNIQUE NOT NULL,
  owner_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Future-ready fields
  capacity_limit INTEGER,
  guest_list_visibility TEXT DEFAULT 'host_only' CHECK (guest_list_visibility IN ('host_only', 'public', 'attendees_only')),
  plan_tier TEXT DEFAULT 'free' CHECK (plan_tier IN ('free', 'pro', 'business'))
);

-- RSVPs table
CREATE TABLE IF NOT EXISTS rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_info TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('yes', 'no', 'maybe')),
  plus_one INTEGER DEFAULT 0 CHECK (plus_one >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_admin_secret ON events(admin_secret);
CREATE INDEX IF NOT EXISTS idx_events_owner_user_id ON events(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_events_organizer_email ON events(organizer_email);
CREATE INDEX IF NOT EXISTS idx_rsvps_event_id ON rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_created_at ON rsvps(created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- -----------------------------------------------------------------------------
-- 002: Add notify_on_rsvp
-- -----------------------------------------------------------------------------
ALTER TABLE events
ADD COLUMN IF NOT EXISTS notify_on_rsvp BOOLEAN NOT NULL DEFAULT true;


-- -----------------------------------------------------------------------------
-- 003: Add user role and Stripe
-- -----------------------------------------------------------------------------
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'superadmin'));

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'trialing', null));

CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_stripe_subscription_id ON users(stripe_subscription_id);

ALTER TABLE events
ADD COLUMN IF NOT EXISTS stripe_subscription_item_id TEXT,
ADD COLUMN IF NOT EXISTS upgraded_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS upgraded_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Set super-admin user (zak@aozakari.com)
UPDATE users 
SET role = 'superadmin' 
WHERE email = 'zak@aozakari.com';


-- -----------------------------------------------------------------------------
-- 004: Add custom RSVP fields
-- -----------------------------------------------------------------------------
ALTER TABLE events
ADD COLUMN IF NOT EXISTS custom_rsvp_fields JSONB DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_events_custom_rsvp_fields ON events USING GIN (custom_rsvp_fields);


-- -----------------------------------------------------------------------------
-- 005: Add logging tables
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level TEXT NOT NULL CHECK (level IN ('error', 'warn', 'info')),
  message TEXT NOT NULL,
  context JSONB,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'bounced')),
  error_message TEXT,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_error_logs_level ON error_logs(level);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_event_id ON error_logs(event_id);

CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_to_email ON email_logs(to_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_event_id ON email_logs(event_id);


-- -----------------------------------------------------------------------------
-- 006: Add lifecycle and manage fields
-- -----------------------------------------------------------------------------
ALTER TABLE events
ADD COLUMN IF NOT EXISTS ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rsvp_deadline TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rsvp_open BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE rsvps
ADD COLUMN IF NOT EXISTS anonymized_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_events_rsvp_open ON events(rsvp_open);
CREATE INDEX IF NOT EXISTS idx_events_starts_at ON events(starts_at);


-- -----------------------------------------------------------------------------
-- 007: Extend theme options (advanced_themes)
-- -----------------------------------------------------------------------------
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_theme_check;
ALTER TABLE events ADD CONSTRAINT events_theme_check
  CHECK (theme IN ('light', 'dark', 'ocean', 'forest', 'sunset', 'midnight', 'rose', 'lavender'));


-- -----------------------------------------------------------------------------
-- 008: Add OG image URL (link_preview_cards)
-- -----------------------------------------------------------------------------
ALTER TABLE events ADD COLUMN IF NOT EXISTS og_image_url TEXT;


-- -----------------------------------------------------------------------------
-- 009: Add RSVP custom field values
-- -----------------------------------------------------------------------------
ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS custom_field_values JSONB DEFAULT '{}'::jsonb;


-- -----------------------------------------------------------------------------
-- 010: Event analytics
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS event_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('page_view', 'rsvp', 'manage_open')),
  date DATE NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  UNIQUE(event_id, metric_type, date)
);

CREATE INDEX IF NOT EXISTS idx_event_analytics_event_date ON event_analytics(event_id, date);


-- -----------------------------------------------------------------------------
-- 011: Share controls (Business only)
-- -----------------------------------------------------------------------------
ALTER TABLE events ADD COLUMN IF NOT EXISTS custom_share_message TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS hide_branding_in_share BOOLEAN DEFAULT FALSE;


-- -----------------------------------------------------------------------------
-- 012: Email reminders (Business only)
-- -----------------------------------------------------------------------------
ALTER TABLE events ADD COLUMN IF NOT EXISTS send_reminder_1_day BOOLEAN DEFAULT FALSE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ;


-- -----------------------------------------------------------------------------
-- 013: White label (Business only)
-- -----------------------------------------------------------------------------
ALTER TABLE events ADD COLUMN IF NOT EXISTS hide_branding BOOLEAN DEFAULT FALSE;


-- -----------------------------------------------------------------------------
-- 014: Keep live (Keep purchase: event stays live, no Pro features)
-- -----------------------------------------------------------------------------
ALTER TABLE events ADD COLUMN IF NOT EXISTS keep_live BOOLEAN DEFAULT FALSE;


-- -----------------------------------------------------------------------------
-- 015: Premium page design (Pro/Hub)
-- -----------------------------------------------------------------------------
ALTER TABLE events ADD COLUMN IF NOT EXISTS page_style TEXT DEFAULT 'modern'
  CHECK (page_style IN ('classic', 'modern', 'bold'));

ALTER TABLE events ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS poster_image_url TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS cover_image_position TEXT DEFAULT 'center'
  CHECK (cover_image_position IN ('top', 'center', 'bottom'));


-- -----------------------------------------------------------------------------
-- 016: Request-to-attend mode (Pro/Hub)
-- -----------------------------------------------------------------------------
ALTER TABLE events ADD COLUMN IF NOT EXISTS rsvp_mode TEXT DEFAULT 'instant'
  CHECK (rsvp_mode IN ('instant', 'request'));

ALTER TABLE events ADD COLUMN IF NOT EXISTS hide_location_until_approved BOOLEAN DEFAULT FALSE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS hide_private_note_until_approved BOOLEAN DEFAULT FALSE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS private_note TEXT;

ALTER TABLE rsvps DROP CONSTRAINT IF EXISTS rsvps_status_check;
ALTER TABLE rsvps ADD CONSTRAINT rsvps_status_check
  CHECK (status IN ('yes', 'no', 'maybe', 'pending', 'approved', 'declined'));


-- -----------------------------------------------------------------------------
-- 017: Atomic capacity enforcement
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION invy_rsvp_contribution(p_status TEXT, p_plus_one INT)
RETURNS NUMERIC AS $$
BEGIN
  IF p_status IN ('yes', 'approved') THEN
    RETURN 1 + COALESCE(p_plus_one, 0);
  ELSIF p_status = 'maybe' THEN
    RETURN 0.5 + COALESCE(p_plus_one, 0) * 0.5;
  ELSE
    RETURN 0;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION invy_exact_occupancy(p_event_id UUID)
RETURNS NUMERIC AS $$
  SELECT COALESCE(SUM(invy_rsvp_contribution(status, plus_one)), 0)
  FROM rsvps
  WHERE event_id = p_event_id;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION create_rsvp_with_capacity_check(
  p_event_id UUID,
  p_name TEXT,
  p_contact_info TEXT,
  p_status TEXT,
  p_plus_one INT DEFAULT 0,
  p_custom_field_values JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_capacity INT;
  v_occupancy NUMERIC;
  v_contribution NUMERIC;
  v_new_rsvp rsvps%ROWTYPE;
BEGIN
  SELECT capacity_limit INTO v_capacity
  FROM events
  WHERE id = p_event_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Event not found' USING ERRCODE = 'P0002';
  END IF;

  IF v_capacity IS NULL OR v_capacity <= 0 THEN
    INSERT INTO rsvps (event_id, name, contact_info, status, plus_one, custom_field_values)
    VALUES (p_event_id, p_name, p_contact_info, p_status, COALESCE(p_plus_one, 0), p_custom_field_values)
    RETURNING * INTO v_new_rsvp;
    RETURN to_jsonb(v_new_rsvp);
  END IF;

  v_occupancy := invy_exact_occupancy(p_event_id);
  v_contribution := invy_rsvp_contribution(p_status, p_plus_one);

  IF v_occupancy + v_contribution > v_capacity THEN
    RAISE EXCEPTION 'This event is fully booked. No spots remaining.' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO rsvps (event_id, name, contact_info, status, plus_one, custom_field_values)
  VALUES (p_event_id, p_name, p_contact_info, p_status, COALESCE(p_plus_one, 0), p_custom_field_values)
  RETURNING * INTO v_new_rsvp;

  RETURN to_jsonb(v_new_rsvp);
END;
$$;

CREATE OR REPLACE FUNCTION approve_rsvps_with_capacity_check(
  p_admin_secret TEXT,
  p_event_id UUID,
  p_rsvp_ids UUID[],
  p_status TEXT
)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
  v_capacity INT;
  v_occupancy NUMERIC;
  v_additional NUMERIC := 0;
  v_count INT;
BEGIN
  SELECT capacity_limit INTO v_capacity
  FROM events
  WHERE id = p_event_id AND admin_secret = p_admin_secret
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid manage link' USING ERRCODE = 'P0003';
  END IF;

  IF p_status = 'declined' THEN
    UPDATE rsvps
    SET status = 'declined'
    WHERE event_id = p_event_id AND id = ANY(p_rsvp_ids) AND status = 'pending';
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
  END IF;

  IF v_capacity IS NOT NULL AND v_capacity > 0 THEN
    v_occupancy := invy_exact_occupancy(p_event_id);

    SELECT COALESCE(SUM(invy_rsvp_contribution('approved', plus_one)), 0) INTO v_additional
    FROM rsvps
    WHERE event_id = p_event_id AND id = ANY(p_rsvp_ids) AND status = 'pending';

    IF v_occupancy + v_additional > v_capacity THEN
      RAISE EXCEPTION 'Approving would exceed capacity limit.' USING ERRCODE = 'P0001';
    END IF;
  END IF;

  UPDATE rsvps
  SET status = 'approved'
  WHERE event_id = p_event_id AND id = ANY(p_rsvp_ids) AND status = 'pending';

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;


-- -----------------------------------------------------------------------------
-- 018: Organizer contact section (Pro/Hub)
-- -----------------------------------------------------------------------------
ALTER TABLE events ADD COLUMN IF NOT EXISTS show_organizer_contact BOOLEAN DEFAULT FALSE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS organizer_contact_email TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS organizer_contact_phone TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS organizer_contact_instagram TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS organizer_contact_whatsapp TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS organizer_contact_text TEXT;
