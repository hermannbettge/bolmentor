-- Add soft-delete support to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deleted_snapshot JSONB DEFAULT NULL;

-- Index for fast trash queries
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON profiles (deleted_at) WHERE deleted_at IS NOT NULL;
