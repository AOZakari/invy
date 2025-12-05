-- Add notify_on_rsvp flag to events
ALTER TABLE events
ADD COLUMN IF NOT EXISTS notify_on_rsvp BOOLEAN NOT NULL DEFAULT true;


