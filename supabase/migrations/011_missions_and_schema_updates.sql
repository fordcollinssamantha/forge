-- Add city normalization column to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS city_normalized text;

-- Add tutorial tracking to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS tutorial_completed boolean DEFAULT false;

-- Note: motivation column already exists (migration 010)

-- Add emojis array column to checkins for multiple emoji selection
ALTER TABLE checkins ADD COLUMN IF NOT EXISTS emojis text[];

-- Migrate existing single emoji data into the new array column
UPDATE checkins SET emojis = ARRAY[emoji] WHERE emoji IS NOT NULL AND emojis IS NULL;

-- Create missions table for Daily Missions feature
CREATE TABLE IF NOT EXISTS missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  source text NOT NULL DEFAULT 'suggested',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  reflection text,
  points_awarded int DEFAULT 0
);

-- Enable RLS on missions
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (matches existing pattern)
CREATE POLICY "service_role_all_missions" ON missions
  FOR ALL USING (true) WITH CHECK (true);
