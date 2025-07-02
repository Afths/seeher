-- Remove "none of the above" from memberships arrays
UPDATE public.women 
SET memberships = array_remove(memberships, 'none of the above')
WHERE memberships IS NOT NULL AND 'none of the above' = ANY(memberships);