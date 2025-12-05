-- Add role field to users table for super-admin
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'superadmin'));

-- Add index for role lookups
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Add Stripe fields for billing (future integration)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'trialing', null));

-- Add indexes for Stripe lookups
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_stripe_subscription_id ON users(stripe_subscription_id);

-- Add upgrade tracking fields to events (for per-event upgrades)
ALTER TABLE events
ADD COLUMN IF NOT EXISTS stripe_subscription_item_id TEXT,
ADD COLUMN IF NOT EXISTS upgraded_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS upgraded_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Set super-admin user (zak@aozakari.com)
-- This will update existing user if they exist, or be ready for when they sign up
UPDATE users 
SET role = 'superadmin' 
WHERE email = 'zak@aozakari.com';

-- If user doesn't exist yet, create a placeholder (will be replaced on actual signup)
-- Note: This requires the user to sign up first, but we've set the role update above
-- for when they do sign up via Supabase Auth

