-- RLS Policy Refinement
-- ============================================
-- Drivers, Vehicles, Trips → all authenticated users (OPERATOR + SUPER_ADMIN)
-- Payments, Reports → SUPER_ADMIN only
-- ============================================

-- ============================================
-- 1. DRIVERS — drop superadmin-only, allow all authenticated
-- ============================================

drop policy if exists "Only super admins can insert drivers" on public.drivers;
drop policy if exists "Only super admins can update drivers" on public.drivers;
drop policy if exists "Only super admins can delete drivers" on public.drivers;

create policy "All authenticated users can insert drivers"
  on public.drivers for insert
  with check (auth.role() = 'authenticated');

create policy "All authenticated users can update drivers"
  on public.drivers for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "All authenticated users can delete drivers"
  on public.drivers for delete
  using (auth.role() = 'authenticated');

-- ============================================
-- 2. VEHICLES — drop superadmin-only, allow all authenticated
-- ============================================

drop policy if exists "Only super admins can insert vehicles" on public.vehicles;
drop policy if exists "Only super admins can update vehicles" on public.vehicles;
drop policy if exists "Only super admins can delete vehicles" on public.vehicles;

create policy "All authenticated users can insert vehicles"
  on public.vehicles for insert
  with check (auth.role() = 'authenticated');

create policy "All authenticated users can update vehicles"
  on public.vehicles for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "All authenticated users can delete vehicles"
  on public.vehicles for delete
  using (auth.role() = 'authenticated');

-- ============================================
-- 3. TRIPS — change delete from superadmin-only to all authenticated
-- ============================================

drop policy if exists "Only super admins can delete trips" on public.trips;

create policy "All authenticated users can delete trips"
  on public.trips for delete
  using (auth.role() = 'authenticated');

-- ============================================
-- 4. PAYMENTS — restrict to SUPER_ADMIN only
-- ============================================

drop policy if exists "All authenticated users can insert payments" on public.payments;
drop policy if exists "All authenticated users can update payments" on public.payments;
drop policy if exists "Only super admins can delete payments" on public.payments;

create policy "Only super admins can insert payments"
  on public.payments for insert
  with check (public.is_super_admin());

create policy "Only super admins can update payments"
  on public.payments for update
  using (public.is_super_admin())
  with check (public.is_super_admin());

create policy "Only super admins can delete payments"
  on public.payments for delete
  using (public.is_super_admin());

-- ============================================
-- 5. EXPENSES — allow all authenticated (existing policies kept)
--    Add missing updated_at column and trigger
-- ============================================

alter table public.expenses add column if not exists updated_at timestamptz not null default now();

create trigger set_updated_at_expenses
  before update on public.expenses
  for each row
  execute function public.handle_updated_at();

-- ============================================
-- 6. PROFILES — add status column (active/inactive)
-- ============================================

alter table public.profiles add column if not exists status text not null default 'active'
  check (status in ('active', 'inactive'));
