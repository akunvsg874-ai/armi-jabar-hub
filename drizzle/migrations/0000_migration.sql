create extension if not exists pgcrypto with schema extensions;

create type public.app_role as enum ('admin','bendahara','anggota');
create type public.status_anggota as enum ('aktif','non_aktif');
create type public.kategori_keuangan as enum ('KAS','KEORGANISASIAN','KOMUNITAS','SUMBANGAN_SOSIAL');
create type public.tipe_transaksi as enum ('pemasukan','pengeluaran');
create type public.jenis_kegiatan as enum ('SOSIAL','KOPDAR','EKSEKUSI','ANNIVERSARY');

create sequence public.nomor_anggota_seq start 1;

-- user_roles
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "own roles readable" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

-- anggota
create table public.anggota (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique,
  nomor_anggota text not null unique,
  nama_lengkap text not null,
  no_hp text not null,
  wilayah text not null,
  nama_usaha text not null,
  status public.status_anggota not null default 'aktif',
  role public.app_role not null default 'anggota',
  created_at timestamptz not null default now()
);
grant select on public.anggota to authenticated;
grant all on public.anggota to service_role;
alter table public.anggota enable row level security;
create policy "anggota read own or staff" on public.anggota for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'bendahara'));

create or replace function public.next_nomor_anggota()
returns text language sql volatile security definer set search_path = public as $$
  select 'ARMI-JBR-' || lpad(nextval('public.nomor_anggota_seq')::text, 4, '0')
$$;
revoke execute on function public.next_nomor_anggota() from public, anon, authenticated;
grant execute on function public.next_nomor_anggota() to service_role;

create or replace function public.peek_nomor_anggota()
returns text language sql stable security definer set search_path = public as $$
  select 'ARMI-JBR-' || lpad((case when is_called then last_value + 1 else last_value end)::text, 4, '0') from public.nomor_anggota_seq
$$;
grant execute on function public.peek_nomor_anggota() to authenticated;

-- public member search (safe columns only)
create or replace function public.cari_anggota_publik(q text)
returns table (nomor_anggota text, nama_lengkap text, nama_usaha text, wilayah text, status public.status_anggota)
language sql stable security definer set search_path = public as $$
  select a.nomor_anggota, a.nama_lengkap, a.nama_usaha, a.wilayah, a.status from public.anggota a
  where coalesce(q,'') = '' or a.nama_lengkap ilike '%'||q||'%' or a.nama_usaha ilike '%'||q||'%' or a.wilayah ilike '%'||q||'%'
  order by a.nama_lengkap limit 100
$$;
grant execute on function public.cari_anggota_publik(text) to anon, authenticated;

create or replace function public.statistik_publik()
returns json language sql stable security definer set search_path = public as $$
  select json_build_object('anggota', (select count(*) from public.anggota where status='aktif'))
$$;
grant execute on function public.statistik_publik() to anon, authenticated;

-- blacklist
create table public.blacklist (
  id uuid primary key default gen_random_uuid(),
  nama_konsumen text not null,
  nik text,
  wilayah text not null,
  no_hp_konsumen text,
  keterangan text not null,
  tanggal_input date not null default current_date,
  input_by text not null
);
grant select, insert, update, delete on public.blacklist to authenticated;
grant all on public.blacklist to service_role;
alter table public.blacklist enable row level security;
create policy "admin all blacklist" on public.blacklist for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create or replace function public.cari_blacklist(q text)
returns table (id uuid, nama_konsumen text, wilayah text, keterangan text, tanggal_input date)
language sql stable security definer set search_path = public as $$
  select b.id, b.nama_konsumen, b.wilayah, b.keterangan, b.tanggal_input from public.blacklist b
  where auth.uid() is not null
    and exists (select 1 from public.anggota a where a.user_id = auth.uid() and a.status='aktif')
    and (coalesce(q,'') = '' or b.nama_konsumen ilike '%'||q||'%' or b.nik ilike '%'||q||'%' or b.wilayah ilike '%'||q||'%')
  order by b.tanggal_input desc limit 100
$$;
revoke execute on function public.cari_blacklist(text) from public, anon;
grant execute on function public.cari_blacklist(text) to authenticated;

-- sub kategori
create table public.sub_kategori (
  id uuid primary key default gen_random_uuid(),
  kategori public.kategori_keuangan not null,
  nama text not null,
  unique (kategori, nama)
);
grant select, insert, delete on public.sub_kategori to authenticated;
grant all on public.sub_kategori to service_role;
alter table public.sub_kategori enable row level security;
create policy "staff read sub" on public.sub_kategori for select to authenticated
  using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'bendahara'));
create policy "admin insert sub" on public.sub_kategori for insert to authenticated
  with check (public.has_role(auth.uid(),'admin'));
create policy "admin delete sub" on public.sub_kategori for delete to authenticated
  using (public.has_role(auth.uid(),'admin'));

-- transaksi
create table public.transaksi (
  id uuid primary key default gen_random_uuid(),
  kategori public.kategori_keuangan not null,
  sub_kategori text not null,
  tipe public.tipe_transaksi not null,
  nominal numeric(14,0) not null check (nominal > 0),
  tanggal date not null default current_date,
  keterangan text,
  input_by text not null,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.transaksi to authenticated;
grant all on public.transaksi to service_role;
alter table public.transaksi enable row level security;
create policy "staff all transaksi" on public.transaksi for all to authenticated
  using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'bendahara'))
  with check (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'bendahara'));

-- kegiatan
create table public.kegiatan (
  id uuid primary key default gen_random_uuid(),
  judul text not null,
  jenis public.jenis_kegiatan not null,
  tanggal date not null,
  deskripsi text not null,
  lokasi text not null,
  foto text not null default 'https://placehold.co/600x400/1E1E1E/FF5722?text=Foto+Kegiatan',
  created_at timestamptz not null default now()
);
grant select on public.kegiatan to anon;
grant select, insert, update, delete on public.kegiatan to authenticated;
grant all on public.kegiatan to service_role;
alter table public.kegiatan enable row level security;
create policy "public read kegiatan" on public.kegiatan for select to anon, authenticated using (true);
create policy "admin write kegiatan" on public.kegiatan for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- seed login accounts
do $$
declare
  u record;
  uid uuid;
begin
  for u in select * from (values
    ('ARMI-JBR-0001','Admin DPD Jabar','081200000001','Kota Bandung','ARMI Sekretariat','admin','ArmiAdm1'),
    ('ARMI-JBR-0002','Siti Rahmawati','081200000002','Kota Bekasi','Rahma Trans','bendahara','ArmiBnd2'),
    ('ARMI-JBR-0003','Budi Santoso','081200000003','Kabupaten Bogor','Santoso Rent Car','anggota','ArmiAgt3')
  ) as t(nomor,nama,hp,wil,usaha,role,pw)
  loop
    uid := gen_random_uuid();
    insert into auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,confirmation_token,recovery_token,email_change_token_new,email_change)
    values ('00000000-0000-0000-0000-000000000000',uid,'authenticated','authenticated',lower(u.nomor)||'@armi.local',extensions.crypt(u.pw, extensions.gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}','{}',now(),now(),'','','','');
    insert into auth.identities (id,user_id,provider_id,identity_data,provider,last_sign_in_at,created_at,updated_at)
    values (gen_random_uuid(),uid,uid::text,json_build_object('sub',uid::text,'email',lower(u.nomor)||'@armi.local','email_verified',true)::jsonb,'email',now(),now(),now());
    insert into public.user_roles(user_id, role) values (uid, u.role::public.app_role);
    insert into public.anggota(user_id,nomor_anggota,nama_lengkap,no_hp,wilayah,nama_usaha,role)
    values (uid,u.nomor,u.nama,u.hp,u.wil,u.usaha,u.role::public.app_role);
  end loop;
end $$;

insert into public.anggota(nomor_anggota,nama_lengkap,no_hp,wilayah,nama_usaha,status,role) values
('ARMI-JBR-0004','Asep Hidayat','081200000004','Kota Bogor','Hidayat Rental','aktif','anggota'),
('ARMI-JBR-0005','Dewi Lestari','081200000005','Kota Cirebon','Lestari Car Rental','aktif','anggota'),
('ARMI-JBR-0006','Rudi Kurniawan','081200000006','Kabupaten Garut','Garut Jaya Trans','non_aktif','anggota'),
('ARMI-JBR-0007','Yanti Sopiah','081200000007','Kota Tasikmalaya','Sopiah Rent','aktif','anggota'),
('ARMI-JBR-0008','Dedi Mulyadi','081200000008','Kabupaten Karawang','Mulya Auto Rental','aktif','anggota');

select setval('public.nomor_anggota_seq', 8, true);

insert into public.sub_kategori(kategori,nama) values
('KAS','Iuran Bulanan'),('KEORGANISASIAN','Kopdar Biaya'),('KOMUNITAS','Kopdar Biaya'),
('SUMBANGAN_SOSIAL','Duka Cita'),('SUMBANGAN_SOSIAL','Bantuan Sosial');

insert into public.transaksi(kategori,sub_kategori,tipe,nominal,tanggal,keterangan,input_by) values
('KAS','Iuran Bulanan','pemasukan',5000000,'2026-10-01','Iuran Oktober','ARMI-JBR-0002'),
('KEORGANISASIAN','Kopdar Biaya','pengeluaran',1500000,'2026-10-05','Sewa tempat kopdar','ARMI-JBR-0002'),
('SUMBANGAN_SOSIAL','Duka Cita','pengeluaran',750000,'2026-10-08','Santunan keluarga anggota','ARMI-JBR-0001'),
('KOMUNITAS','Kopdar Biaya','pemasukan',2000000,'2026-10-10','Sponsor kopdar','ARMI-JBR-0002'),
('SUMBANGAN_SOSIAL','Bantuan Sosial','pemasukan',3000000,'2026-09-20','Donasi anggota','ARMI-JBR-0001');

insert into public.kegiatan(judul,jenis,tanggal,deskripsi,lokasi) values
('Bakti Sosial Panti Asuhan','SOSIAL','2026-11-02','Pembagian sembako dan santunan untuk anak yatim bersama anggota DPD.','Kota Bandung'),
('Kopdar Akbar Jawa Barat','KOPDAR','2026-11-15','Kopi darat seluruh anggota se-Jawa Barat, sharing bisnis dan penguatan jaringan.','Kabupaten Bogor'),
('Eksekusi Unit Bermasalah','EKSEKUSI','2026-10-28','Tim Pandawa Korlap mendampingi penarikan unit yang digelapkan konsumen.','Kota Bekasi'),
('Anniversary ARMI Jabar','ANNIVERSARY','2026-12-12','Perayaan hari jadi DPD ARMI Jawa Barat dengan konvoi dan malam apresiasi.','Kota Bandung'),
('Kopdar Wilayah Priangan Timur','KOPDAR','2026-09-21','Silaturahmi anggota wilayah Garut, Tasikmalaya, dan Ciamis.','Kota Tasikmalaya');

insert into public.blacklist(nama_konsumen,nik,wilayah,no_hp_konsumen,keterangan,tanggal_input,input_by) values
('Joko Prasetyo','3273010101900001','Kota Bandung','081300000001','Unit tidak dikembalikan, digadaikan','2026-09-12','ARMI-JBR-0001'),
('Andi Wijaya','3175020202880002','Jakarta','081300000002','Identitas palsu, unit dibawa kabur','2026-10-02','ARMI-JBR-0001'),
('Rina Marlina','3216030303920003','Kabupaten Bekasi','081300000003','Tunggakan sewa 2 bulan','2026-10-11','ARMI-JBR-0001');