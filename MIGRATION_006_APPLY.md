# Apply migration 006 (required for new MVP features)

The Supabase project is not linked via CLI, so run this migration manually.

1. Open your **Supabase Dashboard** → **SQL Editor**.
2. Paste and run the contents of `supabase/migrations/006_add_lifecycle_and_manage_fields.sql`:

```sql
-- Lifecycle and organizer management fields for MVP
ALTER TABLE events
ADD COLUMN IF NOT EXISTS ends_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rsvp_deadline TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rsvp_open BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE rsvps
ADD COLUMN IF NOT EXISTS anonymized_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_events_rsvp_open ON events(rsvp_open);
CREATE INDEX IF NOT EXISTS idx_events_starts_at ON events(starts_at);
```

3. Confirm no errors. New columns use `IF NOT EXISTS` / `IF NOT EXISTS` so safe to run once.

After this, the deployed app at https://invy-xi.vercel.app will use ends_at, rsvp_deadline, rsvp_open, and capacity/expiry/management features correctly.
