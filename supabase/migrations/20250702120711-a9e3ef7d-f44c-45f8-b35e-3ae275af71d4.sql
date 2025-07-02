-- Create RLS policy for admins to view pending and rejected submissions
CREATE POLICY "Admins can view pending and rejected submissions" 
ON public.women 
FOR SELECT 
USING (
  is_admin(auth.uid()) AND 
  status IN ('PENDING_APPROVAL', 'NOT_APPROVED')
);