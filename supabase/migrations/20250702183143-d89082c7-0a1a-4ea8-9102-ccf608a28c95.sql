-- Allow anonymous users to submit profiles for approval
CREATE POLICY "Allow anonymous profile submissions" 
ON public.women 
FOR INSERT 
TO anon
WITH CHECK (user_id IS NULL AND status = 'PENDING_APPROVAL');