-- Add a one-line topic summary to conversations for varied opening messages
alter table conversations add column if not exists summary text;
