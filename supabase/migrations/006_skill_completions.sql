-- Skill completion tracking for Layer 2: Social Skills Library
CREATE TABLE IF NOT EXISTS skill_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, module_id, lesson_id)
);

-- Index for fast lookups by user
CREATE INDEX IF NOT EXISTS idx_skill_completions_user_id ON skill_completions(user_id);

-- RLS policies
ALTER TABLE skill_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own completions"
  ON skill_completions FOR SELECT
  USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Users can insert own completions"
  ON skill_completions FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));
