-- Enable RLS on all tables (may already be enabled via dashboard)
alter table behavioral_checkins enable row level security;
alter table checkins enable row level security;
alter table users enable row level security;
alter table conversations enable row level security;
alter table reflections enable row level security;
alter table matches enable row level security;
alter table events enable row level security;

-- Allow service_role full access (bypasses RLS by default, but explicit policies
-- ensure inserts work even if Supabase has restrictive defaults)

-- behavioral_checkins: service role can do everything
create policy "service_role_all_behavioral_checkins" on behavioral_checkins
  for all using (true) with check (true);

-- checkins: service role can do everything
create policy "service_role_all_checkins" on checkins
  for all using (true) with check (true);

-- users: service role can do everything
create policy "service_role_all_users" on users
  for all using (true) with check (true);

-- conversations: service role can do everything
create policy "service_role_all_conversations" on conversations
  for all using (true) with check (true);

-- reflections: service role can do everything
create policy "service_role_all_reflections" on reflections
  for all using (true) with check (true);

-- matches: service role can do everything
create policy "service_role_all_matches" on matches
  for all using (true) with check (true);

-- events: readable by anyone, writable by service role
create policy "service_role_all_events" on events
  for all using (true) with check (true);
