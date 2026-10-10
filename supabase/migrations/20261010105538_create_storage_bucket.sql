-- Create a public bucket for theme previews
INSERT INTO storage.buckets (id, name, public)
VALUES ('theme-previews', 'theme-previews', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to read files from this bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'theme-previews');
