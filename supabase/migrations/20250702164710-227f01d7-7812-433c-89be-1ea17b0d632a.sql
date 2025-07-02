-- Drop the view completely first
DROP VIEW IF EXISTS public.women_public CASCADE;

-- Convert interested_in from text to text[] to allow multiple roles
ALTER TABLE public.women 
ALTER COLUMN interested_in TYPE text[] 
USING CASE 
  WHEN interested_in IS NULL THEN NULL 
  ELSE ARRAY[interested_in] 
END;