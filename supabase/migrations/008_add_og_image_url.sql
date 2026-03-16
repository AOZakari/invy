-- Per-event OG image for social shares (Pro+ link_preview_cards)
ALTER TABLE events ADD COLUMN IF NOT EXISTS og_image_url TEXT;
