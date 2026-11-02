-- Stores the minimum/latest app versions for force-update checks.
CREATE TABLE IF NOT EXISTS public.app_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL CHECK (platform IN ('android', 'ios')),
  min_version TEXT NOT NULL,
  latest_version TEXT NOT NULL,
  force_update BOOLEAN NOT NULL DEFAULT FALSE,
  store_url TEXT,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.app_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read app_versions" ON public.app_versions;
CREATE POLICY "Public read app_versions"
  ON public.app_versions
  FOR SELECT
  USING (true);

-- Seed an initial row. Update these values for every release.
INSERT INTO public.app_versions (platform, min_version, latest_version, force_update, store_url, message)
VALUES (
  'android',
  '1.0.3',
  '1.0.3',
  FALSE,
  'https://play.google.com/store/apps/details?id=com.iconaura',
  'A new version of IconAura is available. Please update to continue.'
)
ON CONFLICT DO NOTHING;
