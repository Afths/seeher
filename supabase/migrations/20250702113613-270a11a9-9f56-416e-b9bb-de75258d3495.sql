-- Add status field to women table
ALTER TABLE public.women ADD COLUMN status TEXT DEFAULT 'PENDING_APPROVAL';

-- Update all existing records to APPROVED status
UPDATE public.women SET status = 'APPROVED';

-- Add user_id field to track who submitted the profile
ALTER TABLE public.women ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Create user profiles table for authentication
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = _user_id
      AND role = 'admin'
  )
$$;

-- Update RLS policies for women table
DROP POLICY IF EXISTS "Allow public read access to women" ON public.women;
DROP POLICY IF EXISTS "Allow anonymous read access to women" ON public.women;

-- Allow reading approved profiles publicly
CREATE POLICY "Allow public read access to approved women" 
ON public.women 
FOR SELECT 
USING (status = 'APPROVED');

-- Allow users to read their own submissions
CREATE POLICY "Users can view their own submissions" 
ON public.women 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to insert their own profiles
CREATE POLICY "Users can submit their own profiles" 
ON public.women 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own profiles (except status and created_at)
CREATE POLICY "Users can update their own profiles" 
ON public.women 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow admins to update status
CREATE POLICY "Admins can update status" 
ON public.women 
FOR UPDATE 
TO authenticated
USING (public.is_admin(auth.uid()));

-- Create trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

-- Create trigger for new user signups
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();