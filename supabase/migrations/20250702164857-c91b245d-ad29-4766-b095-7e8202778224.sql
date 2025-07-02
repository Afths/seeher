-- Add a new CHECK constraint for the array type
ALTER TABLE public.women 
ADD CONSTRAINT women_interested_in_check 
CHECK (
  interested_in IS NULL OR 
  (interested_in <@ ARRAY['speaker'::text, 'panelist'::text, 'board member'::text] AND cardinality(interested_in) > 0)
);

-- Recreate the view
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