-- Create storage bucket for profile pictures
INSERT INTO storage.buckets (id, name, public) VALUES ('profiles', 'profiles', true);

-- Create policies for profile picture uploads
CREATE POLICY "Profile images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'profiles');

CREATE POLICY "Anyone can upload profile images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'profiles');

CREATE POLICY "Anyone can update profile images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'profiles');