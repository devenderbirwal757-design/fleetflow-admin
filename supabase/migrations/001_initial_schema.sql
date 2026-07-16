-- FleetFlow Database Schema
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. EXTENSIONS
-- ============================================
create extension if not exists "uuid-ossp";

-- ============================================
-- 2. HELPER FUNCTIONS
-- ============================================

-- Get current user's role from profiles table
create or replace function public.get_user_role()
returns text
language sql
security definer
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- Check if current user is SUPER_ADMIN
create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'SUPER_ADMIN'
  );
$$;


-- ============================================
-- 3. TABLES
-- ============================================

-- 3.1 PROFILES (extends auth.users)
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null default '',
  email       text not null,
  role        text not null default 'OPERATOR' check (role in ('SUPER_ADMIN', 'OPERATOR')),
  phone       text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 3.2 DRIVERS
create table if not exists public.drivers (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  phone           text not null,
  license_number  text not null,
  license_expiry  date not null,
  address         text,
  joining_date    date not null default current_date,
  salary_type     text not null default 'per_trip' check (salary_type in ('fixed', 'per_trip', 'percentage')),
  status          text not null default 'available' check (status in ('available', 'on_trip', 'off_duty', 'inactive')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- 3.3 VEHICLES
create table if not exists public.vehicles (
  id                uuid primary key default uuid_generate_v4(),
  vehicle_number    text not null unique,
  vehicle_type      text not null default 'sedan' check (vehicle_type in ('sedan', 'suv', 'hatchback', 'van', 'bus', 'other')),
  brand_model       text not null,
  seating_capacity  integer not null default 4,
  fuel_type         text not null default 'petrol' check (fuel_type in ('petrol', 'diesel', 'cng', 'electric', 'other')),
  insurance_expiry  date not null,
  permit_expiry     date,
  rc_number         text,
  fitness_expiry    date,
  status            text not null default 'available' check (status in ('available', 'on_trip', 'maintenance', 'inactive')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- 3.4 TRIPS
create table if not exists public.trips (
  id                    uuid primary key default uuid_generate_v4(),
  customer_name         text not null,
  customer_phone        text not null,
  pickup_location       text not null,
  drop_location         text not null,
  trip_date             date not null,
  trip_time             time,
  trip_type             text not null default 'one_way' check (trip_type in ('one_way', 'round_trip', 'airport', 'rental')),
  driver_id             uuid references public.drivers(id) on delete set null,
  vehicle_id            uuid references public.vehicles(id) on delete set null,
  status                text not null default 'pending' check (status in ('pending', 'assigned', 'started', 'completed', 'cancelled')),
  total_amount          decimal(12,2),
  advance_amount        decimal(12,2) not null default 0,
  notes                 text,
  special_requirements  text,
  created_by            uuid references public.profiles(id) on delete set null,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- 3.5 EXPENSES
create table if not exists public.expenses (
  id            uuid primary key default uuid_generate_v4(),
  trip_id       uuid references public.trips(id) on delete cascade,
  category      text not null check (category in ('fuel', 'toll', 'driver_allowance', 'parking', 'maintenance', 'food', 'other')),
  amount        decimal(12,2) not null,
  description   text,
  bill_url      text,
  expense_date  date not null default current_date,
  created_by    uuid references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now()
);

-- 3.6 PAYMENTS
create table if not exists public.payments (
  id              uuid primary key default uuid_generate_v4(),
  trip_id         uuid references public.trips(id) on delete cascade not null,
  amount          decimal(12,2) not null,
  payment_mode    text not null check (payment_mode in ('cash', 'upi', 'card', 'bank_transfer', 'other')),
  payment_status  text not null default 'pending' check (payment_status in ('paid', 'partial', 'pending')),
  payment_date    date not null default current_date,
  notes           text,
  created_by      uuid references public.profiles(id) on delete set null,
  created_at      timestamptz not null default now()
);

-- ============================================
-- 4. INDEXES
-- ============================================

-- Profiles
create index idx_profiles_role on public.profiles(role);

-- Drivers
create index idx_drivers_status on public.drivers(status);
create index idx_drivers_phone on public.drivers(phone);

-- Vehicles
create index idx_vehicles_status on public.vehicles(status);
create index idx_vehicles_number on public.vehicles(vehicle_number);

-- Trips
create index idx_trips_status on public.trips(status);
create index idx_trips_date on public.trips(trip_date);
create index idx_trips_driver on public.trips(driver_id);
create index idx_trips_vehicle on public.trips(vehicle_id);
create index idx_trips_created_by on public.trips(created_by);

-- Expenses
create index idx_expenses_trip on public.expenses(trip_id);
create index idx_expenses_category on public.expenses(category);
create index idx_expenses_date on public.expenses(expense_date);

-- Payments
create index idx_payments_trip on public.payments(trip_id);
create index idx_payments_status on public.payments(payment_status);

-- ============================================
-- 5. AUTO-CREATE PROFILE ON SIGNUP
-- ============================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'role', 'OPERATOR')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ============================================
-- 6. UPDATED_AT TRIGGERS
-- ============================================

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at_profiles
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

create trigger set_updated_at_drivers
  before update on public.drivers
  for each row
  execute function public.handle_updated_at();

create trigger set_updated_at_vehicles
  before update on public.vehicles
  for each row
  execute function public.handle_updated_at();

create trigger set_updated_at_trips
  before update on public.trips
  for each row
  execute function public.handle_updated_at();

-- ============================================
-- 7. ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.drivers enable row level security;
alter table public.vehicles enable row level security;
alter table public.trips enable row level security;
alter table public.expenses enable row level security;
alter table public.payments enable row level security;

-- 7.1 PROFILES RLS
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Super admins can read all profiles"
  on public.profiles for select
  using (public.is_super_admin());

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Super admins can update any profile"
  on public.profiles for update
  using (public.is_super_admin())
  with check (public.is_super_admin());

-- 7.2 DRIVERS RLS
create policy "All authenticated users can read drivers"
  on public.drivers for select
  using (auth.role() = 'authenticated');

create policy "Only super admins can insert drivers"
  on public.drivers for insert
  with check (public.is_super_admin());

create policy "Only super admins can update drivers"
  on public.drivers for update
  using (public.is_super_admin())
  with check (public.is_super_admin());

create policy "Only super admins can delete drivers"
  on public.drivers for delete
  using (public.is_super_admin());

-- 7.3 VEHICLES RLS
create policy "All authenticated users can read vehicles"
  on public.vehicles for select
  using (auth.role() = 'authenticated');

create policy "Only super admins can insert vehicles"
  on public.vehicles for insert
  with check (public.is_super_admin());

create policy "Only super admins can update vehicles"
  on public.vehicles for update
  using (public.is_super_admin())
  with check (public.is_super_admin());

create policy "Only super admins can delete vehicles"
  on public.vehicles for delete
  using (public.is_super_admin());

-- 7.4 TRIPS RLS
create policy "All authenticated users can read trips"
  on public.trips for select
  using (auth.role() = 'authenticated');

create policy "All authenticated users can insert trips"
  on public.trips for insert
  with check (auth.role() = 'authenticated');

create policy "All authenticated users can update trips"
  on public.trips for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Only super admins can delete trips"
  on public.trips for delete
  using (public.is_super_admin());

-- 7.5 EXPENSES RLS
create policy "All authenticated users can read expenses"
  on public.expenses for select
  using (auth.role() = 'authenticated');

create policy "All authenticated users can insert expenses"
  on public.expenses for insert
  with check (auth.role() = 'authenticated');

create policy "All authenticated users can update expenses"
  on public.expenses for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Only super admins can delete expenses"
  on public.expenses for delete
  using (public.is_super_admin());

-- 7.6 PAYMENTS RLS
create policy "All authenticated users can read payments"
  on public.payments for select
  using (auth.role() = 'authenticated');

create policy "All authenticated users can insert payments"
  on public.payments for insert
  with check (auth.role() = 'authenticated');

create policy "All authenticated users can update payments"
  on public.payments for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Only super admins can delete payments"
  on public.payments for delete
  using (public.is_super_admin());
