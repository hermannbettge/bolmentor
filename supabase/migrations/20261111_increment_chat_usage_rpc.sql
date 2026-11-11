-- Atomic upsert + increment for maya_chat_usage to prevent race conditions
-- under concurrent requests from the same user.
create or replace function increment_chat_usage(p_user_id uuid, p_date date)
returns void language plpgsql security definer as $$
begin
  insert into maya_chat_usage (user_id, usage_date, count)
  values (p_user_id, p_date, 1)
  on conflict (user_id, usage_date)
  do update set count = maya_chat_usage.count + 1;
end;
$$;
