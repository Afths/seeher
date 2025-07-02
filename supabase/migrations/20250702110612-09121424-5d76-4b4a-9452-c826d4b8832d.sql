-- Enable Row Level Security on women table
ALTER TABLE public.women ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow read access to all users (since this is public data)
CREATE POLICY "Allow public read access to women" 
ON public.women 
FOR SELECT 
USING (true);

-- Also allow anonymous access
CREATE POLICY "Allow anonymous read access to women" 
ON public.women 
FOR SELECT 
TO anon 
USING (true);