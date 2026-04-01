-- Social Confidence Points: score_events table
create table score_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  action_type text not null check (action_type in ('skill_card', 'practice', 'post_game_review')),
  points int not null,
  reference_id text, -- e.g. lessonId, scenarioId — used to prevent duplicate awards
  created_at timestamptz default now()
);

-- Index for fast lookups by user
create index idx_score_events_user_id on score_events(user_id);

-- Prevent duplicate skill_card awards per lesson
create unique index idx_score_events_unique_skill on score_events(user_id, action_type, reference_id)
  where action_type = 'skill_card';

-- RLS
alter table score_events enable row level security;

create policy "service_role_all_score_events" on score_events
  for all using (true) with check (true);
