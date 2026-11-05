CREATE TABLE IF NOT EXISTS public.theme_patterns (
  theme_id UUID NOT NULL REFERENCES public.themes(id) ON DELETE CASCADE,
  pattern_id UUID NOT NULL REFERENCES public.patterns(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  PRIMARY KEY (theme_id, pattern_id)
);

ALTER TABLE public.theme_patterns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Theme patterns viewable by everyone" ON public.theme_patterns;
CREATE POLICY "Theme patterns viewable by everyone"
  ON public.theme_patterns FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Service role manages theme patterns" ON public.theme_patterns;
CREATE POLICY "Service role manages theme patterns"
  ON public.theme_patterns FOR ALL
  USING (true)
  WITH CHECK (true);