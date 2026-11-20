-- Weskos homepage CMS setup
-- Run this whole file in Supabase SQL Editor. Safe to run again.

begin;

-- Data API roles need access to the public schema; table access remains protected by grants and RLS.
grant usage on schema public to anon, authenticated;

-- Admin allowlist. Create the email/password user in Supabase Authentication first,
-- then add that user's UUID below (or use the email-based example at the end).
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
drop policy if exists "Admins can read their own allowlist entry" on public.admin_users;
create policy "Admins can read their own allowlist entry"
  on public.admin_users for select to authenticated
  using (user_id = (select auth.uid()));
grant select on public.admin_users to authenticated;

-- One JSON document stores every editable homepage field:
-- hero title/copy/video/timing/images, gallery and section photos, and intro copy.
create table if not exists public.site_content (
  id text primary key check (id = 'home'),
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.site_content enable row level security;
drop policy if exists "Homepage content is public" on public.site_content;
create policy "Homepage content is public"
  on public.site_content for select to anon, authenticated
  using (true);
drop policy if exists "Admins can insert homepage content" on public.site_content;
create policy "Admins can insert homepage content"
  on public.site_content for insert to authenticated
  with check (exists (
    select 1 from public.admin_users where user_id = (select auth.uid())
  ));
drop policy if exists "Admins can update homepage content" on public.site_content;
create policy "Admins can update homepage content"
  on public.site_content for update to authenticated
  using (exists (
    select 1 from public.admin_users where user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.admin_users where user_id = (select auth.uid())
  ));
grant select on public.site_content to anon, authenticated;
grant insert, update on public.site_content to authenticated;

-- Seed an empty home record. The app fills missing values with its built-in defaults.
insert into public.site_content (id, content)
values ('home', '{}'::jsonb)
on conflict (id) do nothing;

-- Public media bucket used by homepage images and the opening MP4 video (max 10 MB).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'weskos-media',
  'weskos-media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'video/mp4']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'video/mp4'];

-- Supabase Storage already enables RLS on storage.objects; only add bucket policies here.
drop policy if exists "Weskos media is public" on storage.objects;
create policy "Weskos media is public"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'weskos-media');
drop policy if exists "Weskos admins can upload media" on storage.objects;
create policy "Weskos admins can upload media"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'weskos-media'
    and exists (select 1 from public.admin_users where user_id = (select auth.uid()))
  );
drop policy if exists "Weskos admins can update media" on storage.objects;
create policy "Weskos admins can update media"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'weskos-media'
    and exists (select 1 from public.admin_users where user_id = (select auth.uid()))
  )
  with check (
    bucket_id = 'weskos-media'
    and exists (select 1 from public.admin_users where user_id = (select auth.uid()))
  );
drop policy if exists "Weskos admins can delete media" on storage.objects;
create policy "Weskos admins can delete media"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'weskos-media'
    and exists (select 1 from public.admin_users where user_id = (select auth.uid()))
  );
-- Optional product catalog table retained for the public site's published products.
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'Apparel',
  description text,
  price integer,
  image_url text,
  is_featured boolean not null default false,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.products enable row level security;
drop policy if exists "Published products are viewable by everyone" on public.products;
create policy "Published products are viewable by everyone"
  on public.products for select to anon, authenticated
  using (is_published = true);
grant select on public.products to anon, authenticated;

commit;

-- After creating the admin user in Authentication → Users, run this with its email:
-- insert into public.admin_users (user_id)
-- select id from auth.users where lower(email) = lower('admin@example.com')
-- on conflict (user_id) do nothing;
