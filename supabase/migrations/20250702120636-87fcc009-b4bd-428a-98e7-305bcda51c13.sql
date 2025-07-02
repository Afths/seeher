-- Create 5 test records for pending approval testing
INSERT INTO public.women (
  name, 
  email, 
  status, 
  profile_picture_url,
  short_bio,
  job_title,
  company_name,
  consent
) VALUES 
  ('Tester 1', 'mariatechmaniac@gmail.com', 'PENDING_APPROVAL', 'https://via.placeholder.com/150/4A90E2/FFFFFF?text=🤖1', 'Test profile for approval workflow', 'Software Engineer', 'Tech Corp', true),
  ('Tester 2', 'mariatechmaniac@gmail.com', 'PENDING_APPROVAL', 'https://via.placeholder.com/150/7ED321/FFFFFF?text=🤖2', 'Test profile for approval workflow', 'Product Manager', 'Innovation Ltd', true),
  ('Tester 3', 'mariatechmaniac@gmail.com', 'PENDING_APPROVAL', 'https://via.placeholder.com/150/F5A623/FFFFFF?text=🤖3', 'Test profile for approval workflow', 'UX Designer', 'Design Studio', true),
  ('Tester 4', 'mariatechmaniac@gmail.com', 'PENDING_APPROVAL', 'https://via.placeholder.com/150/D0021B/FFFFFF?text=🤖4', 'Test profile for approval workflow', 'Data Scientist', 'Analytics Inc', true),
  ('Tester 5', 'mariatechmaniac@gmail.com', 'PENDING_APPROVAL', 'https://via.placeholder.com/150/9013FE/FFFFFF?text=🤖5', 'Test profile for approval workflow', 'Marketing Director', 'Brand Co', true);