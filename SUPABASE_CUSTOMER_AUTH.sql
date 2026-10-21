-- Apply this in Supabase SQL Editor before enabling customer phone sign-in.
-- The shop marks new retail accounts with account_type = 'customer'. They should
-- authenticate successfully without the staff signup trigger creating a pharmacy.
create or replace function public.create_medpoint_workspace_for_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  new_workspace_id uuid;
  display_name text;
begin
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
