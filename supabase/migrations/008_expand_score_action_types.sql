-- Add new action types: checkin, companion_chat, going_solo
-- Update existing point values to new weights
alter table score_events drop constraint score_events_action_type_check;
alter table score_events add constraint score_events_action_type_check
  check (action_type in ('skill_card', 'practice', 'post_game_review', 'checkin', 'companion_chat', 'going_solo'));
