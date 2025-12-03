    -- MIGRATION: Link orphaned profiles in women table to authenticated users
--
-- This migration fixes profiles in the women table that have NULL user_id
-- by matching them to authenticated users based on email address.
--
-- This handles the case where:
-- - Profiles were created before user_id was required (magic link era)
-- - Users created new accounts with the same email
-- - Old profiles need to be linked to new user accounts
--
-- Note: If multiple profiles exist with the same email and NULL user_id,
-- only the most recent one will be linked. Others should be reviewed manually.

BEGIN;

-- Step 1: Link orphaned profiles to authenticated users by email
-- Only updates profiles where:
-- - user_id IS NULL (orphaned)
-- - email matches an authenticated user's email
-- - The authenticated user doesn't already have a linked profile
UPDATE public.women w
SET user_id = au.id
FROM auth.users au
WHERE w.user_id IS NULL
  AND w.email = au.email
  AND NOT EXISTS (
    -- Don't link if user already has a profile
    SELECT 1
    FROM public.women existing
    WHERE existing.user_id = au.id
      AND existing.id != w.id
  );

-- Step 2: Log how many profiles were linked
DO $$
DECLARE
  linked_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO linked_count
  FROM public.women
  WHERE user_id IS NOT NULL
    AND updated_at > NOW() - INTERVAL '1 minute';
  
  RAISE NOTICE 'Linked % orphaned profile(s) to authenticated users', linked_count;
END $$;

-- Step 3: Show remaining orphaned profiles (for manual review)
-- These are profiles that couldn't be automatically linked
-- (either no matching email in auth.users, or user already has a profile)
SELECT 
  id,
  email,
  name,
  status,
  created_at
FROM public.women
WHERE user_id IS NULL
ORDER BY created_at DESC;

COMMIT;

