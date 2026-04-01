-- Add motivation field to users (what brought them to Forge)
alter table users add column if not exists motivation text;
