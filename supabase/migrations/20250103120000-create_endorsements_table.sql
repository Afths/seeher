-- Create endorsements table
CREATE TABLE public.endorsements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  woman_id UUID NOT NULL REFERENCES public.women(id) ON DELETE CASCADE,
  area_of_expertise TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, woman_id, area_of_expertise)
);

-- Index for efficient queries
CREATE INDEX idx_endorsements_woman_expertise ON public.endorsements(woman_id, area_of_expertise);
CREATE INDEX idx_endorsements_user ON public.endorsements(user_id);

-- RLS Policies
ALTER TABLE public.endorsements ENABLE ROW LEVEL SECURITY;

-- Anyone can read endorsements (for counts)
CREATE POLICY "Anyone can view endorsements"
ON public.endorsements FOR SELECT
USING (true);

-- Only authenticated users can create/delete their own endorsements
CREATE POLICY "Users can create their own endorsements"
ON public.endorsements FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own endorsements"
ON public.endorsements FOR DELETE
USING (auth.uid() = user_id);

