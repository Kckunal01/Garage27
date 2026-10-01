-- Checkout price composition (Terms & Conditions 07–10):
-- products + 4% platform fee + tax/applicable charge + shipping (+ COD fee).
-- Bike-specific parts for a bike above 350cc carry the 40% charge, everything
-- else 18%, so bikes record their displacement. Parts may carry an original /
-- reference price shown crossed out above the selling price.
alter table public.bikes add column if not exists engine_cc integer check (engine_cc > 0);
alter table public.parts add column if not exists compare_at_price integer check (compare_at_price >= 0);
alter table public.orders
  add column if not exists platform_fee integer not null default 0 check (platform_fee >= 0),
  add column if not exists charge integer not null default 0 check (charge >= 0);

update public.bikes set engine_cc = 349 where id in ('bike-re-classic-350', 'bike-re-bullet-350', 'bike-re-hunter-350', 'bike-re-meteor-350', 'bike-re-goan-classic-350');
update public.bikes set engine_cc = 648 where id in ('bike-re-interceptor-650', 'bike-re-super-meteor-650');
update public.bikes set engine_cc = 294 where id = 'bike-jawa-42';
update public.bikes set engine_cc = 334 where id in ('bike-jawa-350', 'bike-jawa-42-bobber', 'bike-jawa-perak', 'bike-yezdi-roadster', 'bike-yezdi-classic', 'bike-yezdi-scrambler');
update public.bikes set engine_cc = 398 where id in ('bike-triumph-speed-400', 'bike-triumph-scrambler-400x');
