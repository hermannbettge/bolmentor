-- Chat sessions: one session per user per day
create table if not exists chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  session_date date not null,
  messages jsonb not null default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, session_date)
);

alter table chat_sessions enable row level security;

create policy "users own their chat sessions"
  on chat_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists chat_sessions_user_date on chat_sessions(user_id, session_date desc);
