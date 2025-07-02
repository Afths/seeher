-- Update all existing records to include all three possible interested_in options
UPDATE public.women 
SET interested_in = ARRAY['speaker', 'panelist', 'board member']
WHERE interested_in IS NOT NULL;