-- Row Level Security Policies for Multi-tenant Application
-- This file contains the RLS policies that were originally in apps/web/supabase/schema.sql

-- Enable RLS on all main tables
ALTER TABLE public.tenants ENABLE row level security;
ALTER TABLE public.memberships ENABLE row level security;
ALTER TABLE public.invoices ENABLE row level security;
ALTER TABLE public.profiles ENABLE row level security;

-- Helper function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT coalesce((SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()), false);
$$;

-- TENANTS policies
DROP POLICY IF EXISTS "tenants_select_members" ON public.tenants;
CREATE POLICY "tenants_select_members" ON public.tenants FOR SELECT
USING (
  public.is_super_admin() OR
  EXISTS (SELECT 1 FROM public.memberships m WHERE m.tenant_id = tenants.id AND m.user_id = auth.uid())
);

DROP POLICY IF EXISTS "tenants_insert_authenticated" ON public.tenants;
CREATE POLICY "tenants_insert_authenticated" ON public.tenants FOR INSERT TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "tenants_update_admins" ON public.tenants;
CREATE POLICY "tenants_update_admins" ON public.tenants FOR UPDATE TO authenticated
USING (
  public.is_super_admin() OR
  EXISTS (SELECT 1 FROM public.memberships m WHERE m.tenant_id = tenants.id AND m.user_id = auth.uid() AND m.role IN ('admin', 'owner'))
);

-- MEMBERSHIPS policies  
DROP POLICY IF EXISTS "memberships_select_members" ON public.memberships;
CREATE POLICY "memberships_select_members" ON public.memberships FOR SELECT TO authenticated
USING (
  public.is_super_admin() OR
  user_id = auth.uid()
);

DROP POLICY IF EXISTS "memberships_insert_admins" ON public.memberships;
CREATE POLICY "memberships_insert_admins" ON public.memberships FOR INSERT TO authenticated
WITH CHECK (
  public.is_super_admin() OR
  user_id = auth.uid()
);

DROP POLICY IF EXISTS "memberships_update_admins" ON public.memberships;
CREATE POLICY "memberships_update_admins" ON public.memberships FOR UPDATE TO authenticated
USING (
  public.is_super_admin() OR
  user_id = auth.uid()
);

DROP POLICY IF EXISTS "memberships_delete_admins" ON public.memberships;
CREATE POLICY "memberships_delete_admins" ON public.memberships FOR DELETE TO authenticated
USING (
  public.is_super_admin() OR
  user_id = auth.uid()
);

-- INVOICES policies
DROP POLICY IF EXISTS "invoices_select_members" ON public.invoices;
CREATE POLICY "invoices_select_members" ON public.invoices FOR SELECT TO authenticated
USING (
  public.is_super_admin() OR
  EXISTS (SELECT 1 FROM public.memberships m WHERE m.tenant_id = invoices.tenant_id AND m.user_id = auth.uid())
);

DROP POLICY IF EXISTS "invoices_insert_members" ON public.invoices;
CREATE POLICY "invoices_insert_members" ON public.invoices FOR INSERT TO authenticated
WITH CHECK (
  public.is_super_admin() OR
  EXISTS (SELECT 1 FROM public.memberships m WHERE m.tenant_id = invoices.tenant_id AND m.user_id = auth.uid())
);

DROP POLICY IF EXISTS "invoices_update_members" ON public.invoices;
CREATE POLICY "invoices_update_members" ON public.invoices FOR UPDATE TO authenticated
USING (
  public.is_super_admin() OR
  EXISTS (SELECT 1 FROM public.memberships m WHERE m.tenant_id = invoices.tenant_id AND m.user_id = auth.uid())
);

DROP POLICY IF EXISTS "invoices_delete_admins" ON public.invoices;
CREATE POLICY "invoices_delete_admins" ON public.invoices FOR DELETE TO authenticated
USING (
  public.is_super_admin() OR
  EXISTS (SELECT 1 FROM public.memberships m WHERE m.tenant_id = invoices.tenant_id AND m.user_id = auth.uid() AND m.role IN ('admin', 'owner'))
);

-- PROFILES policies
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated
USING (
  public.is_super_admin() OR
  id = auth.uid()
);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated
WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated
USING (
  public.is_super_admin() OR
  id = auth.uid()
);
