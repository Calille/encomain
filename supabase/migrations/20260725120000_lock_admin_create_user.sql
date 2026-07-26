-- =============================================================================
-- P0.2 Lock down public.admin_create_user
-- =============================================================================
-- Problem: SECURITY DEFINER admin_create_user was executable by the anon role
-- (and public), which Supabase security advisors flag as privilege escalation.
--
-- This migration:
--   1. Revokes EXECUTE from anon and public
--   2. Grants EXECUTE to service_role (server-side only)
--   3. Grants EXECUTE to authenticated so admin JWTs can still call via RPC
--      (guard below rejects non-admins)
--   4. Replaces the function body with an explicit public.users admin check
--
-- MANUAL DASHBOARD STEP (not applyable via SQL migrations):
--   Enable Auth "Leaked password protection" (Have I Been Pwned check):
--   Dashboard → Authentication → Providers / Attack Protection
--   → Enable "Leaked password protection"
--   Docs: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
-- =============================================================================

REVOKE EXECUTE ON FUNCTION public.admin_create_user(text, text, text, text, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_create_user(text, text, text, text, text) FROM public;

GRANT EXECUTE ON FUNCTION public.admin_create_user(text, text, text, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_create_user(text, text, text, text, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_create_user(
  p_email text,
  p_password text,
  p_full_name text DEFAULT NULL,
  p_role text DEFAULT 'user',
  p_status text DEFAULT 'active'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_is_admin boolean;
BEGIN
  -- Explicit admin guard: caller must be an active admin in public.users
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
      AND role = 'admin'
      AND status = 'active'
  ) INTO v_is_admin;

  IF auth.uid() IS NULL OR NOT v_is_admin THEN
    RAISE EXCEPTION 'Only active admins can create users';
  END IF;

  -- Generate a user ID
  v_user_id := gen_random_uuid();

  -- Create auth user (direct insert; same behaviour as prior function)
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    v_user_id,
    'authenticated',
    'authenticated',
    p_email,
    crypt(p_password, gen_salt('bf')),
    NOW(),
    NULL,
    NULL,
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  );

  -- Create user identity
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  )
  VALUES (
    gen_random_uuid(),
    v_user_id,
    jsonb_build_object('sub', v_user_id::text, 'email', p_email),
    'email',
    NULL,
    NOW(),
    NOW()
  );

  -- Create user profile in users table
  INSERT INTO public.users (
    id,
    email,
    full_name,
    role,
    status,
    requires_password_change,
    created_at,
    updated_at
  )
  VALUES (
    v_user_id,
    p_email,
    p_full_name,
    p_role,
    p_status,
    true,
    NOW(),
    NOW()
  );

  RETURN v_user_id;
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'User with email % already exists', p_email;
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error creating user: %', SQLERRM;
END;
$$;

COMMENT ON FUNCTION public.admin_create_user(text, text, text, text, text) IS
  'Admin-only user creation. EXECUTE revoked from anon/public. Prefer the admin-create-user Edge Function for production admin UI.';
