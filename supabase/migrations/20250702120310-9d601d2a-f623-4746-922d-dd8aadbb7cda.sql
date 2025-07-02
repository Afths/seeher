-- Update the role for mariatechmaniac@yahoo.com to admin
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'mariatechmaniac@yahoo.com';