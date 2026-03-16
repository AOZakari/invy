-- Email reminders (Business only)
ALTER TABLE events ADD COLUMN IF NOT EXISTS send_reminder_1_day BOOLEAN DEFAULT FALSE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ;
