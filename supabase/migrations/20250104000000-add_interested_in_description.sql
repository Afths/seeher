-- Add interested_in_description field to women table
-- This field allows women to provide additional details about their interests
-- (e.g., what they want to talk about, conferences they like, travel willingness, etc.)

ALTER TABLE public.women 
ADD COLUMN interested_in_description TEXT;

-- Update the view to include the new field
DROP VIEW IF EXISTS public.women_public CASCADE;

CREATE VIEW public.women_public 
WITH (security_invoker = true) AS
SELECT 
  id,
  name,
  job_title,
  company_name,
  bio,
  profile_picture,
  areas_of_expertise,
  languages,
  memberships,
  interested_in,
  interested_in_description,
  created_at,
  social_media,
  status
FROM public.women
WHERE status = 'APPROVED';

