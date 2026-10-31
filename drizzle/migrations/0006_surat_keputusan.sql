CREATE TABLE public.surat_keputusan (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kode text NOT NULL UNIQUE DEFAULT substr(replace(gen_random_uuid()::text,'-',''),1,16),
  nomor text NOT NULL UNIQUE,
  anggota_id uuid REFERENCES public.anggota(id) ON DELETE SET NULL,
  tentang text NOT NULL DEFAULT 'PENGANGKATAN KOORDINATOR KEANGGOTAAN' || chr(10) || 'DEWAN PIMPINAN DAERAH JAWA BARAT',
  nama_penerima text NOT NULL,
  jabatan text NOT NULL,
  tingkat text NOT NULL DEFAULT 'Dewan Pimpinan Daerah Jawa Barat',
  menimbang jsonb NOT NULL DEFAULT '[]'::jsonb,
  mengingat jsonb NOT NULL DEFAULT '[]'::jsonb,
  diktum_lain jsonb NOT NULL DEFAULT '[]'::jsonb,
  ditetapkan_di text NOT NULL DEFAULT 'Kota Tasikmalaya, Jawa Barat',
  tanggal_ditetapkan date NOT NULL DEFAULT current_date,
  jabatan_penandatangan text NOT NULL DEFAULT 'plt. Ketua DPD ARMI Jawa Barat',
  nama_penandatangan text NOT NULL,
  ttd_url text,
  status text NOT NULL DEFAULT 'aktif' CHECK (status IN ('aktif','dicabut')),
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.surat_keputusan TO authenticated;
GRANT ALL ON public.surat_keputusan TO service_role;

ALTER TABLE public.surat_keputusan ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin kelola sk" ON public.surat_keputusan FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "anggota baca sk sendiri" ON public.surat_keputusan FOR SELECT TO authenticated
  USING (exists (select 1 from public.anggota a where a.id = surat_keputusan.anggota_id and a.user_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.verifikasi_sk(_kode text)
RETURNS TABLE(kode text, nomor text, tentang text, nama_penerima text, jabatan text, tingkat text, menimbang jsonb, mengingat jsonb, diktum_lain jsonb,
  ditetapkan_di text, tanggal_ditetapkan date, jabatan_penandatangan text, nama_penandatangan text, ttd_url text, status text, updated_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  select s.kode, s.nomor, s.tentang, s.nama_penerima, s.jabatan, s.tingkat, s.menimbang, s.mengingat, s.diktum_lain,
    s.ditetapkan_di, s.tanggal_ditetapkan, s.jabatan_penandatangan, s.nama_penandatangan, s.ttd_url, s.status, s.updated_at
  from public.surat_keputusan s
  where s.kode = trim(_kode) or upper(s.nomor) = upper(trim(_kode))
  limit 1
$$;
GRANT EXECUTE ON FUNCTION public.verifikasi_sk(text) TO anon, authenticated;