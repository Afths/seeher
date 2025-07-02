-- Create a table to store admin email addresses
CREATE TABLE IF NOT EXISTS public.admin_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on admin_emails table
ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;

-- Only admins can view admin emails
CREATE POLICY "Only admins can view admin emails"
ON public.admin_emails
FOR SELECT
USING (is_admin(auth.uid()));

-- Insert the admin email addresses
INSERT INTO public.admin_emails (email) VALUES 
  ('cleo.papadopoulou@pwc.com'),
  ('rodionas2000@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- Update the is_admin function to also check admin_emails table
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = _user_id
      AND role = 'admin'
  ) OR EXISTS (
    SELECT 1 
    FROM auth.users u
    JOIN public.admin_emails ae ON u.email = ae.email
    WHERE u.id = _user_id
  )
$$;

-- Update the handle_new_user function to set admin role for admin emails
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, role)
  VALUES (
    NEW.id, 
    NEW.email,
    CASE 
      WHEN EXISTS (SELECT 1 FROM public.admin_emails WHERE email = NEW.email) 
      THEN 'admin'
      ELSE 'user'
    END
  );
  RETURN NEW;
END;
$$;