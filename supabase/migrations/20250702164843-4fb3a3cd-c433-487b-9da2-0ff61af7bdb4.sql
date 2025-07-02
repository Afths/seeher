-- Completely remove the view and any dependencies
DROP VIEW IF EXISTS public.women_public CASCADE;

-- Drop the CHECK constraint that's preventing the type change
ALTER TABLE public.women DROP CONSTRAINT IF EXISTS women_interested_in_check;

-- Now try the column type change
ALTER TABLE public.women 
ALTER COLUMN interested_in DROP DEFAULT,
ALTER COLUMN interested_in TYPE text[] 
USING CASE 
  WHEN interested_in IS NULL THEN NULL 
  ELSE ARRAY[interested_in] 
END;