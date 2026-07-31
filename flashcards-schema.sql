create table flashcard_decks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table flashcards (
  id uuid default gen_random_uuid() primary key,
  deck_id uuid references flashcard_decks(id) on delete cascade not null,
  front text not null,
  back text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table flashcard_decks enable row level security;
alter table flashcards enable row level security;

create policy "Users can view their own decks"
  on flashcard_decks for select
  using (auth.uid() = user_id);

create policy "Users can create their own decks"
  on flashcard_decks for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own decks"
  on flashcard_decks for delete
  using (auth.uid() = user_id);

create policy "Users can view cards in their decks"
  on flashcards for select
  using (
    exists (
      select 1 from flashcard_decks
      where flashcard_decks.id = flashcards.deck_id
      and flashcard_decks.user_id = auth.uid()
    )
  );

create policy "Users can create cards in their decks"
  on flashcards for insert
  with check (
    exists (
      select 1 from flashcard_decks
      where flashcard_decks.id = flashcards.deck_id
      and flashcard_decks.user_id = auth.uid()
    )
  );

create policy "Users can delete cards in their decks"
  on flashcards for delete
  using (
    exists (
      select 1 from flashcard_decks
      where flashcard_decks.id = flashcards.deck_id
      and flashcard_decks.user_id = auth.uid()
    )
  );
