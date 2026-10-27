alter table profiles
  add column if not exists chat_messages_limit integer default null;
