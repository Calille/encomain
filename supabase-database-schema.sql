-- ============================================
-- COMPLETE SUPABASE DATABASE SCHEMA
-- User Account Management System
-- ============================================
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  requires_password_change BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);

-- ============================================
-- 2. WEBSITES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.websites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('active', 'in_progress', 'completed', 'on_hold')),
  progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_websites_user_id ON public.websites(user_id);
CREATE INDEX IF NOT EXISTS idx_websites_status ON public.websites(status);

-- ============================================
-- 3. BILLING TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.billing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GBP',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'overdue', 'cancelled')),
  billing_period_start DATE NOT NULL,
  billing_period_end DATE NOT NULL,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_billing_user_id ON public.billing(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_status ON public.billing(status);
CREATE INDEX IF NOT EXISTS idx_billing_period ON public.billing(billing_period_start, billing_period_end);

-- ============================================
-- 4. INVOICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  billing_id UUID REFERENCES public.billing(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL UNIQUE,
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GBP',
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'paid', 'overdue', 'cancelled')),
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  notes TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON public.invoices(invoice_number);

-- ============================================
-- 5. PROJECT UPDATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.project_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID NOT NULL REFERENCES public.websites(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  update_type TEXT NOT NULL DEFAULT 'progress' CHECK (update_type IN ('milestone', 'progress', 'issue', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_project_updates_website_id ON public.project_updates(website_id);
CREATE INDEX IF NOT EXISTS idx_project_updates_user_id ON public.project_updates(user_id);
CREATE INDEX IF NOT EXISTS idx_project_updates_created_at ON public.project_updates(created_at DESC);

-- ============================================
-- 6. DATABASE FUNCTIONS
-- ============================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'admin' AND status = 'active'
    FROM public.users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role
    FROM public.users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  invoice_number TEXT;
BEGIN
  -- Get the next invoice number (count of all invoices + 1)
  SELECT COUNT(*) + 1 INTO next_number FROM public.invoices;
  
  -- Format as INV-YYYY-XXXX (e.g., INV-2025-0001)
  invoice_number := 'INV-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(next_number::TEXT, 4, '0');
  
  RETURN invoice_number;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. TRIGGERS FOR UPDATED_AT
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for websites table
DROP TRIGGER IF EXISTS update_websites_updated_at ON public.websites;
CREATE TRIGGER update_websites_updated_at
  BEFORE UPDATE ON public.websites
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 8. TRIGGER FOR AUTO-GENERATING INVOICE NUMBERS
-- ============================================
CREATE OR REPLACE FUNCTION public.set_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    NEW.invoice_number := public.generate_invoice_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_invoice_number_trigger ON public.invoices;
CREATE TRIGGER set_invoice_number_trigger
  BEFORE INSERT ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.set_invoice_number();

-- ============================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_updates ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Users can read their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can view all users
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT
  USING (public.is_admin());

-- Admins can insert users
DROP POLICY IF EXISTS "Admins can insert users" ON public.users;
CREATE POLICY "Admins can insert users" ON public.users
  FOR INSERT
  WITH CHECK (public.is_admin());

-- Admins can update all users
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
CREATE POLICY "Admins can update all users" ON public.users
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admins can delete users
DROP POLICY IF EXISTS "Admins can delete users" ON public.users;
CREATE POLICY "Admins can delete users" ON public.users
  FOR DELETE
  USING (public.is_admin());

-- ============================================
-- WEBSITES TABLE POLICIES
-- ============================================

-- Users can view their own websites
DROP POLICY IF EXISTS "Users can view own websites" ON public.websites;
CREATE POLICY "Users can view own websites" ON public.websites
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all websites
DROP POLICY IF EXISTS "Admins can view all websites" ON public.websites;
CREATE POLICY "Admins can view all websites" ON public.websites
  FOR SELECT
  USING (public.is_admin());

-- Admins can insert websites
DROP POLICY IF EXISTS "Admins can insert websites" ON public.websites;
CREATE POLICY "Admins can insert websites" ON public.websites
  FOR INSERT
  WITH CHECK (public.is_admin());

-- Admins can update all websites
DROP POLICY IF EXISTS "Admins can update all websites" ON public.websites;
CREATE POLICY "Admins can update all websites" ON public.websites
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admins can delete websites
DROP POLICY IF EXISTS "Admins can delete websites" ON public.websites;
CREATE POLICY "Admins can delete websites" ON public.websites
  FOR DELETE
  USING (public.is_admin());

-- ============================================
-- BILLING TABLE POLICIES
-- ============================================

-- Users can view their own billing
DROP POLICY IF EXISTS "Users can view own billing" ON public.billing;
CREATE POLICY "Users can view own billing" ON public.billing
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all billing
DROP POLICY IF EXISTS "Admins can view all billing" ON public.billing;
CREATE POLICY "Admins can view all billing" ON public.billing
  FOR SELECT
  USING (public.is_admin());

-- Admins can insert billing
DROP POLICY IF EXISTS "Admins can insert billing" ON public.billing;
CREATE POLICY "Admins can insert billing" ON public.billing
  FOR INSERT
  WITH CHECK (public.is_admin());

-- Admins can update all billing
DROP POLICY IF EXISTS "Admins can update all billing" ON public.billing;
CREATE POLICY "Admins can update all billing" ON public.billing
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admins can delete billing
DROP POLICY IF EXISTS "Admins can delete billing" ON public.billing;
CREATE POLICY "Admins can delete billing" ON public.billing
  FOR DELETE
  USING (public.is_admin());

-- ============================================
-- INVOICES TABLE POLICIES
-- ============================================

-- Users can view their own invoices
DROP POLICY IF EXISTS "Users can view own invoices" ON public.invoices;
CREATE POLICY "Users can view own invoices" ON public.invoices
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all invoices
DROP POLICY IF EXISTS "Admins can view all invoices" ON public.invoices;
CREATE POLICY "Admins can view all invoices" ON public.invoices
  FOR SELECT
  USING (public.is_admin());

-- Admins can insert invoices
DROP POLICY IF EXISTS "Admins can insert invoices" ON public.invoices;
CREATE POLICY "Admins can insert invoices" ON public.invoices
  FOR INSERT
  WITH CHECK (public.is_admin());

-- Admins can update all invoices
DROP POLICY IF EXISTS "Admins can update all invoices" ON public.invoices;
CREATE POLICY "Admins can update all invoices" ON public.invoices
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admins can delete invoices
DROP POLICY IF EXISTS "Admins can delete invoices" ON public.invoices;
CREATE POLICY "Admins can delete invoices" ON public.invoices
  FOR DELETE
  USING (public.is_admin());

-- ============================================
-- PROJECT UPDATES TABLE POLICIES
-- ============================================

-- Users can view their own project updates
DROP POLICY IF EXISTS "Users can view own updates" ON public.project_updates;
CREATE POLICY "Users can view own updates" ON public.project_updates
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all project updates
DROP POLICY IF EXISTS "Admins can view all updates" ON public.project_updates;
CREATE POLICY "Admins can view all updates" ON public.project_updates
  FOR SELECT
  USING (public.is_admin());

-- Admins can insert project updates
DROP POLICY IF EXISTS "Admins can insert updates" ON public.project_updates;
CREATE POLICY "Admins can insert updates" ON public.project_updates
  FOR INSERT
  WITH CHECK (public.is_admin());

-- Admins can update all project updates
DROP POLICY IF EXISTS "Admins can update all updates" ON public.project_updates;
CREATE POLICY "Admins can update all updates" ON public.project_updates
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admins can delete project updates
DROP POLICY IF EXISTS "Admins can delete updates" ON public.project_updates;
CREATE POLICY "Admins can delete updates" ON public.project_updates
  FOR DELETE
  USING (public.is_admin());

-- ============================================
-- 10. GRANT PERMISSIONS
-- ============================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant access to tables
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.websites TO authenticated;
GRANT ALL ON public.billing TO authenticated;
GRANT ALL ON public.invoices TO authenticated;
GRANT ALL ON public.project_updates TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_invoice_number() TO authenticated;

-- ============================================
-- 11. SAMPLE DATA (OPTIONAL - FOR TESTING)
-- ============================================
-- Uncomment the section below if you want to create a test admin user

/*
-- Step 1: Create an admin user in Supabase Auth first through the dashboard
-- Then run this to create their profile:

INSERT INTO public.users (id, email, full_name, role, status, requires_password_change)
VALUES (
  'YOUR_AUTH_USER_ID_HERE',  -- Replace with the actual UUID from auth.users
  'admin@example.com',
  'Admin User',
  'admin',
  'active',
  false
);

-- Step 2: Create a test client user
INSERT INTO public.users (id, email, full_name, role, status, requires_password_change)
VALUES (
  'YOUR_CLIENT_USER_ID_HERE',  -- Replace with the actual UUID from auth.users
  'client@example.com',
  'Test Client',
  'user',
  'active',
  true
);
*/

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- Your database is now ready to use with the user account system.
-- 
-- Next steps:
-- 1. Create your first admin user in Supabase Auth (Dashboard > Authentication > Users)
-- 2. Note the user's UUID
-- 3. Insert a record in the users table with that UUID and role='admin'
-- 4. Log in to your app at /login
-- ============================================

