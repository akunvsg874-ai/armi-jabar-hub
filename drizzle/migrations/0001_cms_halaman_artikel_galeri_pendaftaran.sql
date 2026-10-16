CREATE TABLE public.halaman (
  slug text PRIMARY KEY,
  seo_title text, seo_description text, og_image text,
  hero_eyebrow text, hero_title text, hero_desc text, hero_image text,
  konten jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.halaman TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.halaman TO authenticated;
GRANT ALL ON public.halaman TO service_role;
ALTER TABLE public.halaman ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read halaman" ON public.halaman FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin write halaman" ON public.halaman FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.artikel (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  judul text NOT NULL, ringkasan text NOT NULL DEFAULT '', isi text NOT NULL DEFAULT '',
  gambar text, seo_title text, seo_description text,
  terbit boolean NOT NULL DEFAULT false,
  tanggal date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.artikel TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.artikel TO authenticated;
GRANT ALL ON public.artikel TO service_role;
ALTER TABLE public.artikel ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read artikel terbit" ON public.artikel FOR SELECT TO anon, authenticated USING (terbit OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin write artikel" ON public.artikel FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.galeri (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  judul text NOT NULL DEFAULT '', gambar text NOT NULL,
  urutan int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.galeri TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.galeri TO authenticated;
GRANT ALL ON public.galeri TO service_role;
ALTER TABLE public.galeri ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read galeri" ON public.galeri FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin write galeri" ON public.galeri FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.pendaftaran (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL CHECK (char_length(nama) BETWEEN 2 AND 120),
  no_hp text NOT NULL CHECK (char_length(no_hp) BETWEEN 8 AND 20),
  wilayah text NOT NULL CHECK (char_length(wilayah) <= 80),
  nama_usaha text NOT NULL CHECK (char_length(nama_usaha) BETWEEN 2 AND 120),
  jumlah_unit int CHECK (jumlah_unit IS NULL OR jumlah_unit BETWEEN 0 AND 10000),
  pesan text CHECK (pesan IS NULL OR char_length(pesan) <= 1000),
  status text NOT NULL DEFAULT 'baru' CHECK (status IN ('baru','dihubungi','diterima','ditolak')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.pendaftaran TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.pendaftaran TO authenticated;
GRANT ALL ON public.pendaftaran TO service_role;
ALTER TABLE public.pendaftaran ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone submit pendaftaran" ON public.pendaftaran FOR INSERT TO anon, authenticated WITH CHECK (status = 'baru');
CREATE POLICY "admin read pendaftaran" ON public.pendaftaran FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin update pendaftaran" ON public.pendaftaran FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin delete pendaftaran" ON public.pendaftaran FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE POLICY "public read media" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'media');
CREATE POLICY "admin insert media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin update media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'media' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin delete media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'media' AND public.has_role(auth.uid(),'admin'));