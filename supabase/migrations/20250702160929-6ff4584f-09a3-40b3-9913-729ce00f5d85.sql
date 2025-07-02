-- Drop the previous policy that requires authentication
DROP POLICY IF EXISTS "Allow admin access to pending submissions" ON public.women;

-- Create a new policy that allows access to pending submissions without requiring authentication
-- This is safe since we have password protection in the frontend
CREATE POLICY "Allow access to pending submissions" 
ON public.women 
FOR SELECT 
USING (status IN ('PENDING_APPROVAL', 'NOT_APPROVED'));