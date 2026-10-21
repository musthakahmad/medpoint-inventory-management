-- MedPoint shared workspace starter schema. Apply in a Supabase project SQL editor.
-- Browser access relies on Supabase Auth and RLS; never put a service-role key in Vite.
create extension if not exists pgcrypto;

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users(id) on delete restrict,
  invite_code text not null unique default encode(gen_random_bytes(12), 'hex'),
  created_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'manager', 'pharmacist', 'cashier')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

-- Existing MedPoint record types are stored together while the UI is migrated
-- to relational tables. This is an organization-wide state document.
create table if not exists public.workspace_state (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  actor_id uuid not null references auth.users(id),
  actor_email text not null,
  timestamp timestamptz not null default now(),
  action text not null,
  entity_type text not null,
  entity_id text not null,
  entity_label text not null,
  details text not null
);

create or replace function public.is_workspace_member(target_workspace uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.workspace_members m
    where m.workspace_id = target_workspace and m.user_id = (select auth.uid())
  );
$$;

create or replace function public.current_workspace_role(target_workspace uuid)
returns text language sql stable security definer set search_path = '' as $$
  select m.role from public.workspace_members m
  where m.workspace_id = target_workspace and m.user_id = (select auth.uid())
  limit 1;
$$;

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.workspace_state enable row level security;
alter table public.audit_events enable row level security;

create policy "Members can view their workspace" on public.workspaces
  for select to authenticated using (public.is_workspace_member(id));
create policy "Owners and managers can update workspace details" on public.workspaces
  for update to authenticated using (public.current_workspace_role(id) in ('owner', 'manager'))
  with check (public.current_workspace_role(id) in ('owner', 'manager'));

create policy "Members can view workspace membership" on public.workspace_members
  for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "Owners and managers can manage membership" on public.workspace_members
  for all to authenticated using (public.current_workspace_role(workspace_id) in ('owner', 'manager'))
  with check (public.current_workspace_role(workspace_id) in ('owner', 'manager'));

create policy "Members can read shared workspace data" on public.workspace_state
  for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "Members can write shared workspace data" on public.workspace_state
  for all to authenticated using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "Members can read workspace audit events" on public.audit_events
  for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "Signed-in members can append audit events" on public.audit_events
  for insert to authenticated with check (public.is_workspace_member(workspace_id) and actor_id = (select auth.uid()));

create or replace function public.create_medpoint_workspace_for_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  new_workspace_id uuid;
  display_name text;
begin
  -- Retail customers use the same Auth project but must not receive a pharmacy workspace.
  if new.raw_user_meta_data ->> 'account_type' = 'customer' then
    return new;
  end if;
  display_name := coalesce(nullif(new.raw_user_meta_data ->> 'workspace_name', ''), 'My Pharmacy');
  insert into public.workspaces (name, owner_id) values (display_name, new.id)
    returning id into new_workspace_id;
  insert into public.workspace_members (workspace_id, user_id, role)
    values (new_workspace_id, new.id, 'owner');
  insert into public.workspace_state (workspace_id, payload, updated_by)
    values (new_workspace_id, '{}'::jsonb, new.id);
  return new;
end;
$$;

drop trigger if exists medpoint_create_workspace_after_signup on auth.users;
create trigger medpoint_create_workspace_after_signup
  after insert on auth.users
  for each row execute function public.create_medpoint_workspace_for_new_user();

create or replace function public.join_medpoint_workspace(invite_code_input text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  target_workspace uuid;
begin
  if auth.uid() is null then raise exception 'Sign in before joining a workspace'; end if;
  select id into target_workspace from public.workspaces where invite_code = invite_code_input;
  if target_workspace is null then raise exception 'Invite code is invalid'; end if;
  insert into public.workspace_members (workspace_id, user_id, role)
    values (target_workspace, auth.uid(), 'pharmacist')
    on conflict (workspace_id, user_id) do nothing;
  return target_workspace;
end;
$$;

revoke all on function public.join_medpoint_workspace(text) from public;
grant execute on function public.join_medpoint_workspace(text) to authenticated;
grant select, update on public.workspaces to authenticated;
grant select, insert, update, delete on public.workspace_members to authenticated;
grant select, insert, update, delete on public.workspace_state to authenticated;
grant select, insert on public.audit_events to authenticated;
