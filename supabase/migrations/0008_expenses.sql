create table if not exists expenses (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null,
  amount      numeric(10,2) not null,
  category    text not null default 'general',
  description text,
  date        date not null default current_date,
  created_at  timestamptz not null default now()
);
