-- Customer order requests for MedPoint.
-- Apply once after SUPABASE_SETUP.sql and SUPABASE_CUSTOMER_AUTH.sql.
-- Requests remain pending until pharmacy staff review availability and price.

alter table public.workspaces
  add column if not exists customer_store_enabled boolean not null default false;

create unique index if not exists workspaces_single_customer_store_idx
  on public.workspaces (customer_store_enabled)
  where customer_store_enabled = true;

create table if not exists public.customer_order_requests (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  customer_user_id uuid not null references auth.users(id) on delete cascade,
  customer_name text not null,
  customer_phone text not null,
  delivery_address text not null,
  delivery_city text not null,
  delivery_pincode text not null,
  items jsonb not null check (jsonb_typeof(items) = 'array'),
  estimated_total numeric(12,2) not null check (estimated_total >= 0),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'rejected')),
  pharmacy_note text not null default '',
  decided_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customer_order_requests_workspace_created_idx
  on public.customer_order_requests (workspace_id, created_at desc);
create index if not exists customer_order_requests_customer_created_idx
  on public.customer_order_requests (customer_user_id, created_at desc);

alter table public.customer_order_requests enable row level security;

drop policy if exists "Customers and workspace staff can read order requests" on public.customer_order_requests;
create policy "Customers and workspace staff can read order requests"
  on public.customer_order_requests for select to authenticated
  using (customer_user_id = (select auth.uid()) or public.is_workspace_member(workspace_id));

revoke all on public.customer_order_requests from anon, authenticated;
grant select on public.customer_order_requests to authenticated;

create or replace function public.set_customer_store_enabled(target_workspace uuid, enabled_input boolean)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then raise exception 'Sign in to manage the online shop'; end if;
  if public.current_workspace_role(target_workspace) not in ('owner', 'manager') then
    raise exception 'Only a workspace owner or manager can change online shop settings';
  end if;
  if enabled_input and exists (
    select 1 from public.workspaces w
    where w.customer_store_enabled = true and w.id <> target_workspace
  ) then
    raise exception 'Another MedPoint workspace is already connected to the customer shop';
  end if;
  update public.workspaces set customer_store_enabled = enabled_input where id = target_workspace;
  if not found then raise exception 'Workspace not found'; end if;
  return enabled_input;
end;
$$;

create or replace function public.submit_customer_order(
  customer_name_input text,
  customer_phone_input text,
  delivery_address_input text,
  delivery_city_input text,
  delivery_pincode_input text,
  items_input jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_workspace uuid;
  new_order_id uuid := gen_random_uuid();
  next_order_number text;
  line jsonb;
  line_count integer;
  line_quantity integer;
  line_price numeric;
  total_estimate numeric := 0;
begin
  if auth.uid() is null then raise exception 'Sign in with your mobile number before placing an order request'; end if;
  if coalesce(customer_name_input, '') !~ '[^[:space:]]' or length(customer_name_input) > 100 then
    raise exception 'Enter a valid customer name';
  end if;
  if customer_phone_input is distinct from (auth.jwt() ->> 'phone') then
    raise exception 'The verified mobile number does not match this account';
  end if;
  if coalesce(delivery_address_input, '') !~ '[^[:space:]]' or length(delivery_address_input) > 300 then
    raise exception 'Enter a valid delivery address';
  end if;
  if coalesce(delivery_city_input, '') !~ '[^[:space:]]' or length(delivery_city_input) > 100 then
    raise exception 'Enter a valid city';
  end if;
  if delivery_pincode_input is null or delivery_pincode_input !~ '^[0-9]{6}$' then raise exception 'Enter a valid 6-digit PIN code'; end if;
  if jsonb_typeof(items_input) is distinct from 'array' then raise exception 'The basket is invalid'; end if;
  line_count := jsonb_array_length(items_input);
  if line_count < 1 or line_count > 30 then raise exception 'Your basket must contain between 1 and 30 product types'; end if;

  for line in select item from jsonb_array_elements(items_input) as items(item) loop
    if jsonb_typeof(line -> 'product_id') is distinct from 'string'
      or jsonb_typeof(line -> 'name') is distinct from 'string'
      or jsonb_typeof(line -> 'quantity') is distinct from 'number'
      or jsonb_typeof(line -> 'unit_price') is distinct from 'number'
      or coalesce(line ->> 'name', '') !~ '[^[:space:]]'
      or length(line ->> 'name') > 160 then
      raise exception 'A basket item is invalid';
    end if;
    if (line ->> 'quantity')::numeric < 1 or (line ->> 'quantity')::numeric > 20
      or (line ->> 'quantity')::numeric <> trunc((line ->> 'quantity')::numeric) then
      raise exception 'A basket quantity must be a whole number from 1 to 20';
    end if;
    line_quantity := (line ->> 'quantity')::integer;
    line_price := (line ->> 'unit_price')::numeric;
    if line_price < 0 or line_price > 100000 then
      raise exception 'A basket quantity or price is outside the allowed range';
    end if;
    total_estimate := total_estimate + line_quantity * line_price;
  end loop;

  select id into target_workspace from public.workspaces where customer_store_enabled = true limit 1;
  if target_workspace is null then raise exception 'The pharmacy has not enabled online order requests yet'; end if;

  next_order_number := 'MP-' || upper(substr(replace(new_order_id::text, '-', ''), 1, 10));
  insert into public.customer_order_requests (
    id, order_number, workspace_id, customer_user_id, customer_name, customer_phone,
    delivery_address, delivery_city, delivery_pincode, items, estimated_total
  ) values (
    new_order_id, next_order_number, target_workspace, auth.uid(), trim(customer_name_input),
    customer_phone_input, trim(delivery_address_input), trim(delivery_city_input),
    delivery_pincode_input, items_input, round(total_estimate, 2)
  );

  return jsonb_build_object(
    'id', new_order_id,
    'order_number', next_order_number,
    'status', 'pending',
    'estimated_total', round(total_estimate, 2)
  );
end;
$$;

create or replace function public.update_customer_order_status(
  order_id_input uuid,
  status_input text,
  pharmacy_note_input text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_workspace uuid;
  current_status text;
  updated_row public.customer_order_requests%rowtype;
begin
  if auth.uid() is null then raise exception 'Sign in before updating an order'; end if;
  if status_input is null or status_input not in ('confirmed', 'rejected') then raise exception 'Choose confirm or reject'; end if;
  select workspace_id, status into target_workspace, current_status
    from public.customer_order_requests where id = order_id_input for update;
  if target_workspace is null then raise exception 'Order request not found'; end if;
  if public.current_workspace_role(target_workspace) not in ('owner', 'manager', 'pharmacist') then
    raise exception 'Only pharmacy management or a pharmacist can confirm customer orders';
  end if;
  if current_status <> 'pending' then raise exception 'This order request has already been reviewed'; end if;
  update public.customer_order_requests
    set status = status_input,
        pharmacy_note = left(coalesce(pharmacy_note_input, ''), 500),
        decided_by = auth.uid(),
        updated_at = now()
    where id = order_id_input
    returning * into updated_row;
  return jsonb_build_object('id', updated_row.id, 'status', updated_row.status, 'order_number', updated_row.order_number);
end;
$$;

revoke all on function public.set_customer_store_enabled(uuid, boolean) from public;
revoke all on function public.submit_customer_order(text, text, text, text, text, jsonb) from public;
revoke all on function public.update_customer_order_status(uuid, text, text) from public;
grant execute on function public.set_customer_store_enabled(uuid, boolean) to authenticated;
grant execute on function public.submit_customer_order(text, text, text, text, text, jsonb) to authenticated;
grant execute on function public.update_customer_order_status(uuid, text, text) to authenticated;
