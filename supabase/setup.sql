-- Run in Supabase SQL Editor. Public bucket is for published image URLs.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('weskos-media', 'weskos-media', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'video/mp4'])
on conflict (id) do update set public = true, file_size_limit = 10485760,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'video/mp4'];

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(), name text not null,
  category text not null default 'Apparel', description text, price integer,
  image_url text, is_featured boolean not null default false,
  is_published boolean not null default false, created_at timestamptz not null default now()
);
alter table public.products enable row level security;
drop policy if exists "Published products are viewable by everyone" on public.products;
create policy "Published products are viewable by everyone" on public.products for select using (is_published = true);

-- Admin allowlist. Create the user under Authentication first, then insert its UUID here.
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
drop policy if exists "Admins can read their own allowlist entry" on public.admin_users;
create policy "Admins can read their own allowlist entry" on public.admin_users
  for select to authenticated using (user_id = (select auth.uid()));

-- The public homepage is readable by visitors; only allowlisted admins may write it.
create table if not exists public.site_content (
  id text primary key check (id = 'home'),
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.site_content enable row level security;
drop policy if exists "Homepage content is public" on public.site_content;
create policy "Homepage content is public" on public.site_content for select using (true);
drop policy if exists "Admins can insert homepage content" on public.site_content;
create policy "Admins can insert homepage content" on public.site_content
  for insert to authenticated with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));
drop policy if exists "Admins can update homepage content" on public.site_content;
create policy "Admins can update homepage content" on public.site_content
  for update to authenticated using (exists (select 1 from public.admin_users where user_id = (select auth.uid())))
  with check (exists (select 1 from public.admin_users where user_id = (select auth.uid())));

-- Uploaded media stays publicly readable; only allowlisted admins can manage it.
drop policy if exists "Weskos media is public" on storage.objects;
create policy "Weskos media is public" on storage.objects for select using (bucket_id = 'weskos-media');
drop policy if exists "Weskos admins can upload media" on storage.objects;
create policy "Weskos admins can upload media" on storage.objects for insert to authenticated
  with check (bucket_id = 'weskos-media' and exists (select 1 from public.admin_users where user_id = (select auth.uid())));
drop policy if exists "Weskos admins can update media" on storage.objects;
create policy "Weskos admins can update media" on storage.objects for update to authenticated
  using (bucket_id = 'weskos-media' and exists (select 1 from public.admin_users where user_id = (select auth.uid())))
  with check (bucket_id = 'weskos-media' and exists (select 1 from public.admin_users where user_id = (select auth.uid())));
drop policy if exists "Weskos admins can delete media" on storage.objects;
create policy "Weskos admins can delete media" on storage.objects for delete to authenticated
  using (bucket_id = 'weskos-media' and exists (select 1 from public.admin_users where user_id = (select auth.uid())));

-- After creating your first Auth user, allowlist its UUID (replace with the real ID):
-- insert into public.admin_users (user_id) values ('00000000-0000-0000-0000-000000000000');
