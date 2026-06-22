-- Income streams: every money source tracked
create table if not exists income_streams (
  id             uuid primary key default gen_random_uuid(),
  user_id        text not null,
  name           text not null,
  type           text not null default 'active',   -- active | passive | building
  skill          text not null default 'other',     -- solar | electrical | renovations | training | ai | job | other
  monthly_amount float not null default 0,
  is_active      boolean not null default true,
  notes          text,
  started_at     date,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Opportunities: mini CRM for every lead and deal
create table if not exists opportunities (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null,
  name        text not null,
  skill       text not null default 'other',
  status      text not null default 'lead',         -- lead | quoted | follow_up | won | lost
  value       float,
  notes       text,
  due_date    date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Seed Locka's current 9-5 as the baseline active income stream
-- User should update monthly_amount to their actual salary
insert into income_streams (user_id, name, type, skill, monthly_amount, notes)
values ('ernest', '9-5 Job', 'active', 'job', 0, 'Update with your actual take-home monthly pay')
on conflict do nothing;
