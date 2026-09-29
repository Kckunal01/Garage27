-- Cash on delivery: how the order is paid, the COD surcharge, and a
-- `placed` status for COD orders accepted without an online payment.
alter table public.orders
  add column if not exists payment_method text not null default 'online'
    check (payment_method in ('online', 'cod')),
  add column if not exists cod_fee integer not null default 0 check (cod_fee >= 0);

alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status in ('pending','awaiting_payment','placed','paid','failed','cancelled','refunded','fulfilled'));
