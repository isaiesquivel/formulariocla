-- Create storage bucket for signed consent documents
INSERT INTO storage.buckets (id, name, public) VALUES ('consentimientos', 'consentimientos', false);

-- RLS: allow anyone to upload (public form, no auth required)
CREATE POLICY "Anyone can upload consent docs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'consentimientos');

-- RLS: allow admin-level reads (authenticated users)
CREATE POLICY "Authenticated users can view consent docs"
ON storage.objects FOR SELECT
USING (bucket_id = 'consentimientos' AND auth.role() = 'authenticated');
