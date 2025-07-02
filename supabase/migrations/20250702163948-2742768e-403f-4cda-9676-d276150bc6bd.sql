-- Update the women_public view to include social_media_links
DROP VIEW IF EXISTS public.women_public;

CREATE VIEW public.women_public AS
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