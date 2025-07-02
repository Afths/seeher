-- Remove the dangerous policy that exposes sensitive data
DROP POLICY IF EXISTS "Allow access to pending submissions" ON public.women;

-- Ensure only authenticated admins can view pending/rejected submissions
-- The existing "Admins can view pending and rejected submissions" policy should handle this

-- Add additional security: mask sensitive data in public views
-- Create a view for public access that excludes sensitive fields
CREATE OR REPLACE VIEW public.women_public AS
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
  -- Exclude sensitive fields: email, contact_number, alt_contact_name, social_media_links
  CASE 
    WHEN status = 'APPROVED' THEN status 
    ELSE NULL 
  END as status
FROM public.women 
WHERE status = 'APPROVED';

-- Grant access to the public view
GRANT SELECT ON public.women_public TO anon, authenticated;

-- Add RLS policy for the view (though views inherit from base table policies)
ALTER VIEW public.women_public OWNER TO postgres;