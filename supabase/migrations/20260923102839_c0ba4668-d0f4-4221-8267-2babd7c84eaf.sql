CREATE POLICY "Anyone can upload drop files"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'drops');