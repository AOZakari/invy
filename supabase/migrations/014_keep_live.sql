-- Keep: event stays live without Pro features (no plan_tier change)
ALTER TABLE events ADD COLUMN IF NOT EXISTS keep_live BOOLEAN DEFAULT FALSE;
