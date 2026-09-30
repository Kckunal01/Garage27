-- About → LET'S TALK: free-form enquiries with optional references
-- (images / PDF in the private references bucket under enquiries/<ref>/, or a link).
create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,                                 -- G27-E-XXXXXX
  customer_name text not null,
  customer_contact text not null,                                 -- WhatsApp number or email, as given
  message text not null,
  link text,
  attachments text[] not null default '{}',
  status text not null default 'new' check (status in ('new','contacted','done','closed')),
  created_at timestamptz not null default now()
);

-- Written only by the server (service role); never readable by the public.
alter table public.enquiries enable row level security;
