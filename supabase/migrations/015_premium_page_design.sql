-- Premium page design: page style, cover image, poster image
-- Pro Event and Organizer Hub only

ALTER TABLE events ADD COLUMN IF NOT EXISTS page_style TEXT DEFAULT 'modern'
  CHECK (page_style IN ('classic', 'modern', 'bold'));

ALTER TABLE events ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS poster_image_url TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS cover_image_position TEXT DEFAULT 'center'
  CHECK (cover_image_position IN ('top', 'center', 'bottom'));
