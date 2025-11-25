-- INVY Database Schema
-- Run this in your Supabase SQL Editor

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

