-- Pattern Detection: Change patterns_detected from text[] to JSONB
alter table conversations alter column patterns_detected type jsonb using null;

-- Anti-Dependency: conversation-level tracking
alter table conversations add column session_duration interval;
alter table conversations add column message_count int default 0;
alter table conversations add column user_initiated boolean default true;

-- Anti-Dependency: user-level tracking
alter table users add column total_conversations int default 0;
alter table users add column first_conversation_date timestamptz;
alter table users add column last_conversation_date timestamptz;
alter table users add column dependency_signals jsonb default '{"conversations_per_week": 0, "longest_gap_hours": 0, "streak_count": 0}'::jsonb;

-- Pattern Cards table
create table pattern_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  pattern_type text not null,
  pattern_message text not null,
  detection_count int default 1,
  state text default 'pending' check (state in ('pending', 'shown', 'accepted', 'dismissed', 'discussed')),
  shown_at timestamptz,
  accepted_at timestamptz,
  dismissed_at timestamptz,
  discussed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS for pattern_cards
alter table pattern_cards enable row level security;
create policy "Service role bypass for pattern_cards"
  on pattern_cards for all
  using (true)
  with check (true);
