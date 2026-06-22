-- Habits table
create table if not exists habits (
  id              uuid primary key default gen_random_uuid(),
  user_id         text not null,
  name            text not null,
  category        text not null, -- health | discipline | wealth | charisma | business
  icon            text not null default '⚡',
  frequency       text not null default 'daily', -- daily | mon-wed-fri | weekdays | custom
  frequency_days  int[] default null,             -- 0=sun,1=mon,...,6=sat
  xp_value        int not null default 20,
  current_streak  int not null default 0,
  longest_streak  int not null default 0,
  last_completed  date,
  active          boolean not null default true,
  created_at      timestamptz not null default now()
);

-- User stats / leveling
create table if not exists user_stats (
  id                    uuid primary key default gen_random_uuid(),
  user_id               text not null unique,
  level                 int not null default 1,
  xp                    int not null default 0,
  xp_next_level         int not null default 150,
  discipline            int not null default 0,
  wealth                int not null default 0,
  health                int not null default 0,
  charisma              int not null default 0,
  business              int not null default 0,
  total_quests_completed int not null default 0,
  total_habits_completed int not null default 0,
  updated_at            timestamptz not null default now()
);

-- Add game columns to tasks
alter table tasks add column if not exists category   text not null default 'general';
alter table tasks add column if not exists xp_value   int  not null default 30;
alter table tasks add column if not exists difficulty text not null default 'normal';
alter table tasks add column if not exists status     text not null default 'open';

-- RLS
alter table habits     enable row level security;
alter table user_stats enable row level security;

create policy "deny_all_habits"     on habits     as restrictive for all using (false);
create policy "deny_all_user_stats" on user_stats as restrictive for all using (false);

-- Seed Locka's default habits
insert into habits (user_id, name, category, icon, frequency, frequency_days, xp_value) values
  ('ernest', 'Gym',          'health',     '🏋️', 'custom',  '{0,1,3,5}', 40),
  ('ernest', 'Water 3L',     'discipline', '💧', 'daily',   null,        20),
  ('ernest', 'Calories 3k',  'health',     '🍽️', 'daily',   null,        20),
  ('ernest', 'Looksmax',     'charisma',   '🪞', 'custom',  '{1,3,5}',   25),
  ('ernest', 'Sales Work',   'business',   '💼', 'weekdays', null,       35),
  ('ernest', 'Run to Work',  'health',     '🏃', 'daily',   null,        30)
on conflict do nothing;

-- Seed Locka's starting stats row
insert into user_stats (user_id) values ('ernest') on conflict do nothing;
