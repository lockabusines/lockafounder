-- Notes / Second Brain
create table if not exists notes (
  id         uuid primary key default gen_random_uuid(),
  user_id    text not null,
  title      text not null,
  body       text,
  tags       text[] default '{}',
  pinned     boolean not null default false,
  contact_id uuid references crm_contacts(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Goals & OKRs
create table if not exists goals (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null,
  title       text not null,
  description text,
  type        text not null default 'quarterly',  -- quarterly | annual | lifetime
  quarter     text,                               -- e.g. "2026-Q3"
  status      text not null default 'active',     -- active | achieved | dropped
  target      numeric,
  current     numeric not null default 0,
  unit        text default '%',                   -- %, £, hrs, etc.
  mission_roi int not null default 3,
  due_date    date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Key Results (linked to goals)
create table if not exists key_results (
  id        uuid primary key default gen_random_uuid(),
  user_id   text not null,
  goal_id   uuid not null references goals(id) on delete cascade,
  title     text not null,
  target    numeric not null default 100,
  current   numeric not null default 0,
  unit      text default '%',
  done      boolean not null default false,
  created_at timestamptz not null default now()
);

-- Projects (Kanban)
create table if not exists projects (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null,
  title       text not null,
  description text,
  status      text not null default 'active',  -- active | paused | completed | archived
  skill       text default 'other',
  mission_roi int not null default 3,
  contact_id  uuid references crm_contacts(id) on delete set null,
  due_date    date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Project tasks (link tasks to projects)
alter table tasks add column if not exists project_id uuid references projects(id) on delete set null;
