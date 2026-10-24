-- Migration: Add missing columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deleted_snapshot JSONB;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS max_events_override INTEGER;
