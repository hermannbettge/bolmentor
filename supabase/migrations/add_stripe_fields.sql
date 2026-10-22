-- Add Stripe customer ID and subscription plan to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_plan TEXT;

-- Index for fast webhook lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);
