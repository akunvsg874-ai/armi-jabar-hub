ALTER TABLE public.blacklist ADD COLUMN riwayat_kasus jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.blacklist ADD COLUMN tanggal_kejadian date;
ALTER TABLE public.blacklist ADD COLUMN bukti jsonb NOT NULL DEFAULT '[]'::jsonb;

CREATE OR REPLACE FUNCTION public.detail_blacklist(_id uuid)
RETURNS TABLE(id uuid, nama_konsumen text, nik text, wilayah text, no_hp_konsumen text, keterangan text, riwayat_kasus jsonb, tanggal_kejadian date, bukti jsonb, tanggal_input date)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  select b.id, b.nama_konsumen, b.nik, b.wilayah, b.no_hp_konsumen, b.keterangan, b.riwayat_kasus, b.tanggal_kejadian, b.bukti, b.tanggal_input
  from public.blacklist b
  where b.id = _id and auth.uid() is not null
    and (public.has_role(auth.uid(),'admin') or exists (select 1 from public.anggota a where a.user_id = auth.uid() and a.status='aktif'))
$$;
GRANT EXECUTE ON FUNCTION public.detail_blacklist(uuid) TO authenticated;

CREATE POLICY "member read bukti blacklist" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'dokumen' AND (storage.foldername(name))[1] = 'bukti'
  AND exists (select 1 from public.anggota a where a.user_id = auth.uid() and a.status='aktif'));