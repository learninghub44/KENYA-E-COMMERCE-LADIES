-- Atomic inventory reservation.
--
-- The checkout flow previously reserved stock with a read-then-write pattern in
-- application code (select quantity_reserved, then update quantity_reserved = old + n).
-- Two concurrent checkouts racing on the same low-stock item could both read the same
-- "available" snapshot and both succeed, oversell the item. These functions push the
-- check-and-increment into a single atomic SQL statement guarded by the table's row lock,
-- so only one of two racing transactions can win when stock is insufficient for both.

create or replace function public.reserve_inventory_item(
  p_product_id uuid,
  p_variant_id uuid,
  p_quantity integer
)
returns table (
  ok boolean,
  available integer
)
language plpgsql
as $$
declare
  v_row public.inventory_items%rowtype;
begin
  if p_quantity <= 0 then
    raise exception 'Reservation quantity must be positive';
  end if;

  select *
    into v_row
    from public.inventory_items
   where product_id = p_product_id
     and (
       (p_variant_id is null and variant_id is null)
       or variant_id = p_variant_id
     )
   for update;

  if not found then
    -- No inventory row tracked for this product/variant: treat as untracked/unlimited.
    return query select true, null::integer;
    return;
  end if;

  if not v_row.track_inventory then
    return query select true, null::integer;
    return;
  end if;

  if (v_row.quantity_available - v_row.quantity_reserved) < p_quantity then
    return query select false, (v_row.quantity_available - v_row.quantity_reserved);
    return;
  end if;

  update public.inventory_items
     set quantity_reserved = quantity_reserved + p_quantity,
         updated_at = now()
   where id = v_row.id;

  return query select true, (v_row.quantity_available - v_row.quantity_reserved - p_quantity);
end;
$$;

create or replace function public.release_inventory_item(
  p_product_id uuid,
  p_variant_id uuid,
  p_quantity integer
)
returns void
language plpgsql
as $$
begin
  update public.inventory_items
     set quantity_reserved = greatest(0, quantity_reserved - p_quantity),
         updated_at = now()
   where product_id = p_product_id
     and (
       (p_variant_id is null and variant_id is null)
       or variant_id = p_variant_id
     )
     and track_inventory = true;
end;
$$;

comment on function public.reserve_inventory_item is
  'Atomically checks and increments quantity_reserved for one product/variant under a row lock. '
  'Returns ok=false with the currently available quantity when stock is insufficient. '
  'Called once per line item from lib/checkout/supabase-inventory-repository.ts.';

comment on function public.release_inventory_item is
  'Atomically decrements quantity_reserved (floored at 0) for one product/variant. '
  'Used to roll back a reservation on checkout failure/cancellation.';
