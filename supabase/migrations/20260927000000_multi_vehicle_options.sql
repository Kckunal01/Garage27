-- Multi-vehicle build options: one option can fit several vehicles.
-- Compatibility = listed in compatible_bike_ids AND the vehicle has the slot
-- (checked by the build engine). affected_nodes = stable model node ids.

alter table public.build_options drop constraint if exists build_options_bike_id_slot_id_fkey;
alter table public.build_options add column compatible_bike_ids text[] not null default '{}';
alter table public.build_options add column affected_nodes text[] not null default '{}';
update public.build_options set compatible_bike_ids = array[bike_id] where bike_id is not null;
alter table public.build_options drop column bike_id;
create index build_options_compat_idx on public.build_options using gin (compatible_bike_ids);

alter table public.bikes add column if not exists year integer;
alter table public.bikes add column if not exists variant text;
alter table public.bikes add column if not exists thumbnail text;
