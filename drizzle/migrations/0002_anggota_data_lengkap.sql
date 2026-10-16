ALTER TABLE public.anggota ALTER COLUMN no_hp SET DEFAULT '';
ALTER TABLE public.anggota
  ADD COLUMN no_anggota text,
  ADD COLUMN ktp_path text,
  ADD COLUMN garasi_path text,
  ADD COLUMN maps_url text,
  ADD COLUMN nib text,
  ADD COLUMN unit jsonb NOT NULL DEFAULT '[]'::jsonb;
CREATE POLICY "admin read dokumen" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'dokumen' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin insert dokumen" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'dokumen' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin update dokumen" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'dokumen' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin delete dokumen" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'dokumen' AND public.has_role(auth.uid(),'admin'));