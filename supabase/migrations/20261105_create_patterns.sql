-- Create patterns table for admin pattern management
CREATE TABLE IF NOT EXISTS public.patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  preview_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.patterns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Patterns are viewable by everyone" ON public.patterns;
CREATE POLICY "Patterns are viewable by everyone"
  ON public.patterns FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Service role manages patterns" ON public.patterns;
CREATE POLICY "Service role manages patterns"
  ON public.patterns FOR ALL
  USING (true)
  WITH CHECK (true);