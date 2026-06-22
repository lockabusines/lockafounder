-- Add mission ROI score to tasks
-- 5 = direct revenue action, 1 = no money link
alter table tasks add column if not exists mission_roi int not null default 3;

-- Add status column if it doesn't exist (from gamification migration)
alter table tasks add column if not exists status text not null default 'open';
alter table tasks add column if not exists category text not null default 'general';
alter table tasks add column if not exists xp_value int not null default 40;
alter table tasks add column if not exists user_id text;
