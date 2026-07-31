alter table notes add column if not exists subject text;

create index if not exists idx_notes_user_subject on notes(user_id, subject);
