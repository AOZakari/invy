-- Extend theme options for Pro/Business (advanced_themes)
-- Drop existing check and add new one with 8 themes

ALTER TABLE events DROP CONSTRAINT IF EXISTS events_theme_check;
ALTER TABLE events ADD CONSTRAINT events_theme_check
  CHECK (theme IN ('light', 'dark', 'ocean', 'forest', 'sunset', 'midnight', 'rose', 'lavender'));
