-- =============================================================================
-- 018: Organizer contact section (Pro/Hub)
-- Optional host contact info displayed on event page
-- =============================================================================

ALTER TABLE events ADD COLUMN IF NOT EXISTS show_organizer_contact BOOLEAN DEFAULT FALSE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS organizer_contact_email TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS organizer_contact_phone TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS organizer_contact_instagram TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS organizer_contact_whatsapp TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS organizer_contact_text TEXT;
