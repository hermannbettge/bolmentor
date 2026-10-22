create table if not exists maya_chat_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  usage_date date not null default current_date,
  count integer not null default 0,
  unique (user_id, usage_date)
);

alter table maya_chat_usage enable row level security;

create policy "Users can read own usage"
  on maya_chat_usage for select
  using (auth.uid() = user_id);
