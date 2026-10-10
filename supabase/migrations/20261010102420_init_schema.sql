-- Create themes table
CREATE TABLE public.themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  config JSONB NOT NULL,
  preview_url TEXT,
  is_public BOOLEAN DEFAULT false,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;

-- Policies
-- Everyone can view public themes
CREATE POLICY "Public themes are viewable by everyone"
ON public.themes FOR SELECT
USING (is_public = true);

-- Users can view their own themes
CREATE POLICY "Users can view their own themes"
ON public.themes FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own themes
CREATE POLICY "Users can create their own themes"
ON public.themes FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own themes
CREATE POLICY "Users can update their own themes"
ON public.themes FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own themes
CREATE POLICY "Users can delete their own themes"
ON public.themes FOR DELETE
USING (auth.uid() = user_id);
