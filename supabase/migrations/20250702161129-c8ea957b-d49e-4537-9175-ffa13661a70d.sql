-- Drop the permissive policy
DROP POLICY IF EXISTS "Allow access to pending submissions" ON public.women;

-- Create a proper admin-only policy that requires authentication and admin role
CREATE POLICY "Admins can view pending and rejected submissions" 
ON public.women 
FOR SELECT 
USING (
  (status IN ('PENDING_APPROVAL', 'NOT_APPROVED')) AND 
  is_admin(auth.uid())
);