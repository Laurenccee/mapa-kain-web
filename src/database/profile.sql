create table profiles (
  -- Link to Supabase Auth
  id uuid references auth.users on delete cascade primary key,
  
  -- Profile Info
  full_name text not null,
  username text unique not null,
  phone_number text,
  avatar_url text,
  
  -- Metadata
  is_onboarded boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Constraints
  constraint username_length check (char_length(username) >= 3)
);

alter table profiles enable row level security;

-- Policies
create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- 1. ALLOW PUBLIC VIEWING (So others can see the profile pic)
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'avatars' );

create policy "Users can upload their own avatar"
on storage.objects for insert
with check (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can update or delete their own avatar"
on storage.objects for all
using (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);