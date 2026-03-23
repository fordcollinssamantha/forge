-- Users table (synced from Clerk)
create table users (
  id uuid primary key default gen_random_uuid(),
  clerk_id text unique not null,
  name text,
  age int,
  city text,
  created_at timestamptz default now()
);

-- Behavioral check-ins (avoidance pattern tracking)
create table behavioral_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  avoidance_response text,
  follow_up_response text,
  created_at timestamptz default now()
);

-- Emotional check-ins
create table checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  emoji text,
  emotion_words text[],
  verbal_description text,
  created_at timestamptz default now()
);

-- AI conversations
create table conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  messages jsonb[],
  patterns_detected text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Events (social situations to attend)
create table events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text,
  date timestamptz,
  location text,
  city text,
  vibe_tags text[],
  going_solo_count int default 0,
  image_url text,
  description text
);

-- Reflections (pre/post event prediction vs reality)
create table reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  event_id uuid references events(id) on delete set null,
  prediction_score int,
  actual_score int,
  notes text,
  created_at timestamptz default now()
);

-- Matches (connecting users going to the same event)
create table matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  matched_user_id uuid references users(id) on delete cascade not null,
  event_id uuid references events(id) on delete cascade not null,
  status text default 'pending',
  created_at timestamptz default now()
);
