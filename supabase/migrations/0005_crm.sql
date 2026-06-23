-- CRM contacts
create table if not exists crm_contacts (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null,
  name        text not null,
  phone       text,
  email       text,
  company     text,
  source      text default 'manual',   -- referral | cold | social | repeat | manual
  skill       text default 'other',    -- solar | electrical | renovations | training | ai | other
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Extend opportunities with more fields
alter table opportunities add column if not exists contact_id uuid references crm_contacts(id) on delete set null;
alter table opportunities add column if not exists description text;
alter table opportunities add column if not exists completed_at timestamptz;
alter table opportunities add column if not exists invoiced_at timestamptz;
alter table opportunities add column if not exists paid_at timestamptz;
