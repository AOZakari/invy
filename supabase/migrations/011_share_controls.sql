-- Share controls (Business only)
ALTER TABLE events ADD COLUMN IF NOT EXISTS custom_share_message TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS hide_branding_in_share BOOLEAN DEFAULT FALSE;
