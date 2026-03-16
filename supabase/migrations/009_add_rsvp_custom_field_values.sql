-- Store custom RSVP field answers (Pro+ custom_rsvp_fields)
ALTER TABLE rsvps ADD COLUMN IF NOT EXISTS custom_field_values JSONB DEFAULT '{}'::jsonb;
