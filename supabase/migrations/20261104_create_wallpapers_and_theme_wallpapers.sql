-- Reusable wallpapers and many-to-many theme assignments.

CREATE TABLE IF NOT EXISTS public.wallpapers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  url TEXT NOT NULL,
  preview_url TEXT
);

CREATE TABLE IF NOT EXISTS public.theme_wallpapers (
  theme_id UUID NOT NULL REFERENCES public.themes(id) ON DELETE CASCADE,
  wallpaper_id UUID NOT NULL REFERENCES public.wallpapers(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (theme_id, wallpaper_id)
);

CREATE INDEX IF NOT EXISTS theme_wallpapers_theme_id_idx
  ON public.theme_wallpapers(theme_id);

CREATE INDEX IF NOT EXISTS theme_wallpapers_wallpaper_id_idx
  ON public.theme_wallpapers(wallpaper_id);

ALTER TABLE public.wallpapers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theme_wallpapers ENABLE ROW LEVEL SECURITY;

-- Public read access (app reads via anon key).
DROP POLICY IF EXISTS "Public read wallpapers" ON public.wallpapers;
CREATE POLICY "Public read wallpapers"
  ON public.wallpapers FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Public read theme_wallpapers" ON public.theme_wallpapers;
CREATE POLICY "Public read theme_wallpapers"
  ON public.theme_wallpapers FOR SELECT
  USING (true);

-- Writes are intended to be performed by the admin tool using the service role key,
-- which bypasses RLS. No client-side write policies are required.
