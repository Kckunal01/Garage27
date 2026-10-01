-- Reference (crossed-out) prices for half the catalogue. Only the reference
-- price changes; the selling price (`price`) is untouched and is what checkout charges.
update public.parts set compare_at_price = 999900 where id = 'part-headlight-7-chrome';
update public.parts set compare_at_price = 399900 where id = 'part-bar-end-mirrors';
update public.parts set compare_at_price = 1149900 where id = 'part-clipons-32';
update public.parts set compare_at_price = 1449900 where id = 'part-seat-solo-brown';
update public.parts set compare_at_price = 1599900 where id = 'part-saddlebags-waxed';
