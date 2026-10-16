ALTER TABLE public.kegiatan
  ADD COLUMN waktu text,
  ADD COLUMN alamat text,
  ADD COLUMN maps_url text,
  ADD COLUMN penyelenggara text,
  ADD COLUMN narahubung text,
  ADD COLUMN dokumentasi jsonb NOT NULL DEFAULT '[]'::jsonb;