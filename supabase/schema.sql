-- AppointEase Now Stage 2 schema (Supabase free tier)
-- Run this in Supabase SQL Editor.

create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null check (role in ('business_owner', 'customer')),
  created_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  business_id uuid not null references public.users(id) on delete cascade,
  guest_name text,
  guest_email text,
  date date not null,
  time time not null,
  status text not null check (status in ('pending', 'confirmed', 'cancelled')) default 'pending',
  created_at timestamptz not null default now()
);

alter table public.appointments alter column user_id drop not null;
alter table public.appointments add column if not exists guest_name text;
alter table public.appointments add column if not exists guest_email text;

alter table public.appointments
  drop constraint if exists appointments_booking_identity_check;

alter table public.appointments
  add constraint appointments_booking_identity_check
  check (
    user_id is not null
    or (
      guest_name is not null
      and guest_email is not null
    )
  );

create unique index if not exists unique_active_business_slot
  on public.appointments (business_id, date, time)
  where status in ('pending', 'confirmed');

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'role', 'customer')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.users enable row level security;
alter table public.appointments enable row level security;

drop policy if exists "Users can view own profile" on public.users;
create policy "Users can view own profile"
  on public.users
  for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile"
  on public.users
  for update
  using (auth.uid() = id);

drop policy if exists "Customers create own appointments" on public.appointments;
create policy "Customers create own appointments"
  on public.appointments
  for insert
  with check (
    (
      auth.uid() is not null
      and auth.uid() = user_id
    )
    or (
      auth.uid() is null
      and user_id is null
      and guest_name is not null
      and guest_email is not null
    )
  );

drop policy if exists "Customers view own appointments" on public.appointments;
create policy "Customers view own appointments"
  on public.appointments
  for select
  using (auth.uid() = user_id);

drop policy if exists "Business owners view their appointments" on public.appointments;
create policy "Business owners view their appointments"
  on public.appointments
  for select
  using (auth.uid() = business_id);

drop policy if exists "Users cancel own appointments" on public.appointments;
create policy "Users cancel own appointments"
  on public.appointments
  for update
  using (auth.uid() = user_id or auth.uid() = business_id)
  with check (auth.uid() = user_id or auth.uid() = business_id);
