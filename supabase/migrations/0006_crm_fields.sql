-- Expanded contact fields
alter table crm_contacts add column if not exists job_title       text;
alter table crm_contacts add column if not exists linkedin        text;
alter table crm_contacts add column if not exists website         text;
alter table crm_contacts add column if not exists industry        text;
alter table crm_contacts add column if not exists company_size    text;  -- 1-10 | 11-50 | 51-200 | 200+
alter table crm_contacts add column if not exists location        text;
alter table crm_contacts add column if not exists account_status  text not null default 'lead';  -- lead | active | churned
alter table crm_contacts add column if not exists owner           text;
alter table crm_contacts add column if not exists last_contact_date date;
alter table crm_contacts add column if not exists next_steps      text;
alter table crm_contacts add column if not exists interaction_log text;  -- running log of call notes / emails

-- Expanded job fields
alter table opportunities add column if not exists expected_close_date date;
alter table opportunities add column if not exists loss_reason         text;
alter table opportunities add column if not exists last_contact_date   date;
alter table opportunities add column if not exists next_steps          text;
alter table opportunities add column if not exists interaction_log     text;
alter table opportunities add column if not exists owner               text;
