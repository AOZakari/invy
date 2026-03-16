-- Event-level analytics (Pro+)
-- Stores daily aggregates: page views, RSVPs, manage opens
CREATE TABLE IF NOT EXISTS event_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('page_view', 'rsvp', 'manage_open')),
  date DATE NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  UNIQUE(event_id, metric_type, date)
);

CREATE INDEX IF NOT EXISTS idx_event_analytics_event_date ON event_analytics(event_id, date);
