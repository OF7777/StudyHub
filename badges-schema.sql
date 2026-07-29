create table badges (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  badge_type text not null,
  name text not null,
  description text not null,
  icon text not null,
  earned_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, badge_type)
);

alter table badges enable row level security;

create policy "Users can view their own badges"
  on badges for select
  using (auth.uid() = user_id);

create policy "Users can create their own badges"
  on badges for insert
  with check (auth.uid() = user_id);
