-- PortraitLab Studio — baseline schema
-- Idempotent: safe to run multiple times, and safe whether `profiles`/`generations`
-- already exist (reverse-engineered from application code) or this is a fresh project.
-- Paste this whole file into the Supabase SQL Editor and run it once.

-- =========================================================================
-- 1. profiles
-- =========================================================================

create table if not exists public.profiles (
    id uuid primary key references auth.users (id) on delete cascade,
    email text,
    plan text not null default 'free',
    free_generations_used int not null default 0,
    created_at timestamptz not null default now()
);

alter table public.profiles add column if not exists role text not null default 'user';
alter table public.profiles add column if not exists is_blocked boolean not null default false;
alter table public.profiles add column if not exists free_generations_limit int;
alter table public.profiles add column if not exists full_name text;

-- Back-fill: admin used to be encoded as plan = 'admin'. Move it to the new
-- role column and normalize plan back to a real billing tier before adding
-- the check constraints below (constraints must never see the old value).
update public.profiles set role = 'admin' where plan = 'admin';
update public.profiles set plan = 'free' where plan = 'admin';

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('user', 'admin'));

alter table public.profiles drop constraint if exists profiles_plan_check;
alter table public.profiles add constraint profiles_plan_check check (plan in ('free', 'pro', 'studio'));

-- =========================================================================
-- 2. generations
-- =========================================================================

create table if not exists public.generations (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users (id) on delete cascade,
    original_image_path text,
    preview_image_path text,
    final_image_path text,
    style text,
    intensity text,
    status text not null default 'completed',
    payment_status text not null default 'unpaid',
    paid_at timestamptz,
    demo boolean not null default false,
    quality text,
    watermark_type text,
    is_pro boolean not null default false,
    prompt_used text,
    variation_token uuid,
    model_provider text,
    model_name text,
    generation_mode text,
    parent_generation_id uuid,
    version_number int,
    feedback_rating text,
    feedback_created_at timestamptz,
    download_count int not null default 0,
    last_downloaded_at timestamptz,
    selected_for_training boolean not null default false,
    admin_quality_rating int,
    admin_notes text,
    created_at timestamptz not null default now()
);

-- Lets background-remove and aging write to the same table instead of a
-- second, conflicting one. All nullable/defaulted so existing rows stay valid.
alter table public.generations add column if not exists tool text not null default 'caricature';
alter table public.generations add column if not exists preset text;
alter table public.generations add column if not exists storage_path text;

create index if not exists generations_user_id_idx on public.generations (user_id);
create index if not exists generations_created_at_idx on public.generations (created_at desc);
create index if not exists generations_tool_idx on public.generations (tool);

-- =========================================================================
-- 3. app_settings — singleton row backing /admin/settings
-- =========================================================================

create table if not exists public.app_settings (
    id smallint primary key default 1,
    free_plan_limit int not null default 3,
    pro_plan_limit int not null default 999,
    studio_plan_limit int not null default 999,
    constraint app_settings_singleton check (id = 1)
);

insert into public.app_settings (id)
values (1)
on conflict (id) do nothing;

-- =========================================================================
-- 4. Auto-create a profile row when a new auth user signs up
-- =========================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.profiles (id, email)
    values (new.id, new.email)
    on conflict (id) do nothing;

    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- =========================================================================
-- 5. Row Level Security
-- =========================================================================

alter table public.profiles enable row level security;
alter table public.generations enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
    for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
    for update using (auth.uid() = id) with check (auth.uid() = id);

-- The update policy above only grants row-level access; the column grant
-- below is what actually restricts *which* columns authenticated users can
-- write. role/plan/is_blocked/free_generations_used/free_generations_limit
-- are intentionally left ungranted here — every write to those today (and
-- going forward) goes through the service-role client, which bypasses RLS
-- and column grants entirely.
revoke update on public.profiles from authenticated;
grant update (full_name) on public.profiles to authenticated;

drop policy if exists "generations_select_own" on public.generations;
create policy "generations_select_own" on public.generations
    for select using (auth.uid() = user_id);

-- No insert/update/delete policy for `authenticated` on generations — all
-- writes happen server-side via the service-role client, as today.

-- =========================================================================
-- 6. Storage
-- =========================================================================

-- The app already expects a bucket named exactly "Caricatures" (capital C,
-- case-sensitive — see lib/storage.ts). This is not something SQL creates;
-- in the Supabase Dashboard go to Storage → New bucket → name it
-- "Caricatures" → Private. All access already goes through the service-role
-- client (signed URLs), so no storage policies are required.
