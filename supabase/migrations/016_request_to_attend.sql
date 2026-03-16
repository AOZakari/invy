-- Request-to-attend mode (Pro/Hub)
-- RSVP mode: instant | request
-- Hide details until approved

ALTER TABLE events ADD COLUMN IF NOT EXISTS rsvp_mode TEXT DEFAULT 'instant'
  CHECK (rsvp_mode IN ('instant', 'request'));

ALTER TABLE events ADD COLUMN IF NOT EXISTS hide_location_until_approved BOOLEAN DEFAULT FALSE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS hide_private_note_until_approved BOOLEAN DEFAULT FALSE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS private_note TEXT;

-- Extend RSVP status for request mode: pending, approved, declined
ALTER TABLE rsvps DROP CONSTRAINT IF EXISTS rsvps_status_check;
ALTER TABLE rsvps ADD CONSTRAINT rsvps_status_check
  CHECK (status IN ('yes', 'no', 'maybe', 'pending', 'approved', 'declined'));
