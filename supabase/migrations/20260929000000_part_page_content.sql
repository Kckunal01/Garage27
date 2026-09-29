-- Product-page copy per part (headline, benefits, extra spec rows, optional
-- installation guide). Optional; see PartPageContent in src/types/catalogue.ts.
alter table public.parts add column if not exists page jsonb;
