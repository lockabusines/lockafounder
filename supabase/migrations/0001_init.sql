-- Enable pgvector extension for memory embeddings
create extension if not exists vector;

-- Entities: people, companies, projects you reference in tasks/CRM
create table if not exists entities (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null,
  name        text not null,
  kind        text not null, -- person | company | project | other
  metadata    jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

-- Raw captures from Telegram / web form before routing
create table if not exists raw_captures (
  id              uuid primary key default gen_random_uuid(),
  user_id         text not null,
  source          text not null, -- telegram | web
  raw_text        text not null,
  audio_url       text,
  classification  jsonb,         -- { kind, urgency, entity_id, tags, summary }
  llm_source      text,          -- anthropic | openai | regex
  routed_to       text,          -- tasks | journal | notes | etc.
  routed_id       uuid,
  created_at      timestamptz not null default now()
);

-- Tasks / CRM entries
create table if not exists tasks (
  id                uuid primary key default gen_random_uuid(),
  user_id           text not null,
  title             text not null,
  description       text,
  urgency           text not null default 'someday', -- today | this_week | this_month | someday
  key               boolean not null default false,
  priority_score    float not null default 0,
  time_estimate_min int,
  tags              text[] not null default '{}',
  due_date          date,
  owner             text,
  entity_id         uuid references entities(id) on delete set null,
  completed_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Daily logs: habits, nutrition, finance snapshot, goals — all stored as JSON blobs
create table if not exists daily_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null,
  log_date    date not null,
  notes       text,              -- JSON string: { habits, nutrition, finance, goals_week_items, goals_month_items }
  mood        int,               -- 1-5
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, log_date)
);

-- Memory chunks for semantic search
create table if not exists memory_chunks (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null,
  source_type text not null, -- capture | task | journal | habit | meal
  source_id   uuid,
  text        text not null,
  embedding   vector(1536),
  created_at  timestamptz not null default now()
);

-- Audit log
create table if not exists audit_log (
  id            uuid primary key default gen_random_uuid(),
  user_id       text not null,
  action        text not null,
  resource_type text,
  resource_id   uuid,
  metadata      jsonb not null default '{}',
  created_at    timestamptz not null default now()
);

-- Indexes
create index if not exists tasks_user_urgency on tasks (user_id, urgency, completed_at);
create index if not exists tasks_user_created on tasks (user_id, created_at desc);
create index if not exists daily_logs_user_date on daily_logs (user_id, log_date desc);
create index if not exists raw_captures_user_created on raw_captures (user_id, created_at desc);

-- Vector index for memory search (requires pgvector ivfflat)
create index if not exists memory_chunks_embedding_idx
  on memory_chunks
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Row Level Security: deny-all by default; service role bypasses RLS
alter table entities     enable row level security;
alter table raw_captures enable row level security;
alter table tasks        enable row level security;
alter table daily_logs   enable row level security;
alter table memory_chunks enable row level security;
alter table audit_log    enable row level security;

-- Deny-all policies (service role key bypasses these automatically)
create policy "deny_all_entities"      on entities      as restrictive for all using (false);
create policy "deny_all_raw_captures"  on raw_captures  as restrictive for all using (false);
create policy "deny_all_tasks"         on tasks         as restrictive for all using (false);
create policy "deny_all_daily_logs"    on daily_logs    as restrictive for all using (false);
create policy "deny_all_memory_chunks" on memory_chunks as restrictive for all using (false);
create policy "deny_all_audit_log"     on audit_log     as restrictive for all using (false);
