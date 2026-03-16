-- White label (Business only) - hide "Powered by INVY" on event pages and emails
ALTER TABLE events ADD COLUMN IF NOT EXISTS hide_branding BOOLEAN DEFAULT FALSE;
