-- Add custom RSVP fields support for Pro/Business users
-- Store as JSONB for flexibility
ALTER TABLE events
ADD COLUMN IF NOT EXISTS custom_rsvp_fields JSONB DEFAULT '[]'::jsonb;

-- Add index for JSONB queries (if needed for filtering)
CREATE INDEX IF NOT EXISTS idx_events_custom_rsvp_fields ON events USING GIN (custom_rsvp_fields);

-- Example structure for custom_rsvp_fields:
-- [
--   {
--     "id": "uuid",
--     "label": "Dietary restrictions",
--     "type": "text" | "select" | "checkbox" | "number",
--     "required": true,
--     "options": ["Vegan", "Vegetarian", "Gluten-free"] // for select/checkbox
--   }
-- ]

