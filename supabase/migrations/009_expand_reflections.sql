-- Expand reflections for post-game review
alter table reflections add column if not exists rating_tier text; -- 'good', 'mixed', 'rough'
alter table reflections add column if not exists what_went_well text;
alter table reflections add column if not exists what_was_awkward text;
alter table reflections add column if not exists next_time text;
