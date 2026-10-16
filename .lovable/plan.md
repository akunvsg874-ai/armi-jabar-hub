# Rencana Pembangunan — ARMI DPD Jawa Barat

Membangun seluruh aplikasi sesuai PRD: situs publik + portal login berbasis peran (Admin, Bendahara, Anggota), tema gelap dengan aksen oranye ARMI, Bahasa Indonesia.

## 1. Fondasi
- Aktifkan **Lovable Cloud** untuk database, login, dan keamanan data.
- Tema gelap: warna brand PRD (#FF5722, #E64A19, #1B5E20, #2E7D32, #121212, #1E1E1E) dijadikan token desain. Font Inter, heading extrabold/black.
- Helper format Rupiah (`Rp 1.000.000`) dan tanggal Indonesia (`16 Oktober 2026`).
- Daftar 27 kabupaten/kota Jawa Barat sebagai pilihan wilayah.

## 2. Halaman Publik
- `/` Beranda: navbar sticky, hero, statistik, grid Info Kegiatan (badge warna per jenis), Program Utama, footer.
- `/tentang` Tentang Kami: deskripsi, visi & misi, program utama.
- `/anggota` Cari Anggota: cari nama/usaha/wilayah, hanya tampilkan nama, usaha, wilayah, status.
- `/kontak` Kontak (ditambahkan karena ada di menu navbar PRD).
- `/login`: Nomor Anggota + Password, pesan error persis sesuai PRD.

## 3. Portal (Login Wajib)
- Sidebar menu berbeda per peran (sesuai bagian 5 PRD), tombol Logout.
- `/dashboard` — konten berbeda Admin / Bendahara / Anggota.
- `/admin/anggota` — CRUD anggota, nomor `ARMI-JBR-XXXX` otomatis, password 8 karakter ditampilkan sekali dalam dialog.
- `/blacklist` — Admin CRUD; Bendahara & Anggota hanya cari (nama, wilayah, keterangan).
- `/keuangan` — filter, ringkasan 4 kategori, tabel, tambah/edit/hapus (Admin & Bendahara), tambah sub-kategori inline (Admin).
- `/kegiatan` — Admin CRUD; lainnya lihat saja.
- `/profil` — data diri, tanpa edit.
- Akses tanpa izin dialihkan ke `/login`.

## 4. Rencana Tambahan (usulan saya)
1. **Keamanan peran di server**: peran disimpan di tabel terpisah dan dicek oleh database, bukan hanya disembunyikan di tampilan — anggota tidak bisa mengakses data keuangan/kelola anggota walau mencoba langsung.
2. **Privasi publik**: halaman Cari Anggota publik tidak pernah mengirim no HP; blacklist tidak pernah tampil ke publik; NIK & no HP konsumen disembunyikan dari anggota biasa.
3. **Akun admin awal**: dibuat otomatis satu akun admin pertama (nomor `ARMI-JBR-0001`) agar Anda bisa langsung login; passwordnya saya sampaikan setelah dibangun.
4. **Data contoh**: beberapa anggota, kegiatan (4 jenis), transaksi, dan sub-kategori ("Duka Cita", "Kopdar Biaya", "Bantuan Sosial", "Iuran Bulanan") agar tampilan langsung terisi.
5. **Reset password oleh admin**: tombol "Reset Password" di Kelola Anggota (PRD tidak mengizinkan reset mandiri, jadi admin yang menanganinya).
6. **Cegah admin menghapus/menonaktifkan dirinya sendiri** agar portal tidak terkunci.
7. **Tombol "Gabung Anggota"** mengarah ke halaman Kontak (karena tidak ada pendaftaran mandiri), "Verifikasi Rental Resmi" ke Cari Anggota.
8. **Tes otomatis** untuk aturan penting: format nomor anggota, panjang password, validasi nominal > 0, pesan error login.

## Detail Teknis
- Login: nomor anggota dipetakan ke email sintetis `arm-jbr-xxxx@armi.local`, auto-confirm aktif; password dibuat & disetel lewat server function admin (service role) — tidak ada pendaftaran publik.
- Tabel: `anggota` (profil, terhubung ke auth user), `user_roles` + fungsi `has_role`, `blacklist`, `sub_kategori`, `transaksi`, `kegiatan`; enum untuk status, role, kategori, tipe, jenis. RLS per peran.
- Nomor anggota dibuat dari sequence database (aman dari duplikat).
- Login memeriksa status `non_aktif` lewat server function sebelum sign-in agar pesan error tepat.
- Pencarian anggota publik lewat view/fungsi terbatas kolom.
- Rute portal di bawah `_authenticated`; route khusus admin dicek peran di `beforeLoad` + RLS.
- Gambar memakai placeholder placehold.co sesuai PRD.
