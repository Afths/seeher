-- Create a new RLS policy that allows anyone authenticated to view pending submissions for admin purposes
CREATE POLICY "Allow admin access to pending submissions" 
ON public.women 
FOR SELECT 
USING (
  status IN ('PENDING_APPROVAL', 'NOT_APPROVED') AND 
  auth.uid() IS NOT NULL
);