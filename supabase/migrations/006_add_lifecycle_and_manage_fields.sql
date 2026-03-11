-- Lifecycle and organizer management fields for MVP
-- Event expiry: computed as starts_at + 7 days in app logic (no expires_at column)

ALTER TABLE events
ADD COLUMN IF NOT EXISTS ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rsvp_deadline TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rsvp_open BOOLEAN NOT NULL DEFAULT true;

-- Optional: future retention cleanup (anonymize RSVP PII after 30 days)
ALTER TABLE rsvps
ADD COLUMN IF NOT EXISTS anonymized_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_events_rsvp_open ON events(rsvp_open);
CREATE INDEX IF NOT EXISTS idx_events_starts_at ON events(starts_at);
