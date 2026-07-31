create table study_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  subject text,
  duration_minutes integer not null default 0,
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  ended_at timestamp with time zone
);

alter table study_sessions enable row level security;

create policy "Users can view their own study sessions"
  on study_sessions for select
  using (auth.uid() = user_id);

create policy "Users can create their own study sessions"
  on study_sessions for insert
  with check (auth.uid() = user_id);

create table subjects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  color text default '#ca8a04',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, name)
);

alter table subjects enable row level security;

create policy "Users can view their own subjects"
  on subjects for select
  using (auth.uid() = user_id);

create policy "Users can create their own subjects"
  on subjects for insert
  with check (auth.uid() = user_id);
