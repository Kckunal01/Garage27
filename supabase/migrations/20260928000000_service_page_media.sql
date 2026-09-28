-- Service page: card copy and photograph per service (both optional).
alter table public.services
  add column if not exists pitch text[],
  add column if not exists image jsonb;
