create table folders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  color text default '#ca8a04',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table note_tags (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  color text default '#ca8a04',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, name)
);

create table note_tag_map (
  note_id uuid references notes(id) on delete cascade not null,
  tag_id uuid references note_tags(id) on delete cascade not null,
  primary key (note_id, tag_id)
);

alter table notes add column if not exists folder_id uuid references folders(id) on delete set null;

alter table folders enable row level security;
alter table note_tags enable row level security;
alter table note_tag_map enable row level security;

create policy "Users can view their own folders"
  on folders for select
  using (auth.uid() = user_id);

create policy "Users can create their own folders"
  on folders for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own folders"
  on folders for delete
  using (auth.uid() = user_id);

create policy "Users can view their own tags"
  on note_tags for select
  using (auth.uid() = user_id);

create policy "Users can create their own tags"
  on note_tags for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own tags"
  on note_tags for delete
  using (auth.uid() = user_id);

create policy "Users can view their note tag mappings"
  on note_tag_map for select
  using (
    exists (
      select 1 from notes
      where notes.id = note_tag_map.note_id
      and notes.user_id = auth.uid()
    )
  );

create policy "Users can create note tag mappings"
  on note_tag_map for insert
  with check (
    exists (
      select 1 from notes
      where notes.id = note_tag_map.note_id
      and notes.user_id = auth.uid()
    )
  );

create policy "Users can delete note tag mappings"
  on note_tag_map for delete
  using (
    exists (
      select 1 from notes
      where notes.id = note_tag_map.note_id
      and notes.user_id = auth.uid()
    )
  );
