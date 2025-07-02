-- Drop the view first to avoid dependency issues
DROP VIEW IF EXISTS public.women_public;

-- Convert interested_in from text to text[] to allow multiple roles
ALTER TABLE public.women 
ALTER COLUMN interested_in TYPE text[] 
USING CASE 
  WHEN interested_in IS NULL THEN NULL 
  ELSE ARRAY[interested_in] 
END;

-- Recreate the view with the updated column type
CREATE VIEW public.women_public 
WITH (security_invoker = true) AS
SELECT 
  id,
  name,
  job_title,
  company_name,
  nationality,
  short_bio,
  long_bio,
  profile_picture_url,
  areas_of_expertise,
  languages,
  keywords,
  memberships,
  interested_in,
  created_at,
  social_media_links,
  status
FROM public.women
WHERE status = 'APPROVED';