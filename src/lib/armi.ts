export const WILAYAH_JABAR = [
  "Kabupaten Bandung", "Kabupaten Bandung Barat", "Kabupaten Bekasi", "Kabupaten Bogor",
  "Kabupaten Ciamis", "Kabupaten Cianjur", "Kabupaten Cirebon", "Kabupaten Garut",
  "Kabupaten Indramayu", "Kabupaten Karawang", "Kabupaten Kuningan", "Kabupaten Majalengka",
  "Kabupaten Pangandaran", "Kabupaten Purwakarta", "Kabupaten Subang", "Kabupaten Sukabumi",
  "Kabupaten Sumedang", "Kabupaten Tasikmalaya", "Kota Bandung", "Kota Banjar", "Kota Bekasi",
  "Kota Bogor", "Kota Cimahi", "Kota Cirebon", "Kota Depok", "Kota Sukabumi", "Kota Tasikmalaya",
] as const;

export const KATEGORI = ["KAS", "KEORGANISASIAN", "KOMUNITAS", "SUMBANGAN_SOSIAL"] as const;
export type Kategori = (typeof KATEGORI)[number];
export const KATEGORI_LABEL: Record<Kategori, string> = {
  KAS: "Kas",
  KEORGANISASIAN: "Keorganisasian",
  KOMUNITAS: "Komunitas",
  SUMBANGAN_SOSIAL: "Sumbangan Sosial",
};

export const JENIS_KEGIATAN = ["SOSIAL", "KOPDAR", "EKSEKUSI", "ANNIVERSARY"] as const;
export type JenisKegiatan = (typeof JENIS_KEGIATAN)[number];
export const JENIS_BADGE: Record<JenisKegiatan, string> = {
  SOSIAL: "bg-success/20 text-success",
  KOPDAR: "bg-primary/20 text-primary",
  EKSEKUSI: "bg-destructive/20 text-destructive",
  ANNIVERSARY: "bg-info/20 text-info",
};

export const LOGO_URL = "https://placehold.co/300x300/FF5722/FFFFFF?text=ARMI+LOGO";
export const FOTO_KEGIATAN = "https://placehold.co/600x400/1E1E1E/FF5722?text=Foto+Kegiatan";
export const FOTO_PROFIL = "https://placehold.co/150x150/1E1E1E/FFFFFF?text=Foto";

export const NOMOR_REGEX = /^ARMI-JBR-\d{4}$/;

export function formatNomor(n: number): string {
  return `ARMI-JBR-${String(n).padStart(4, "0")}`;
}

/** Synthetic login email for a member number. */
export function nomorToEmail(nomor: string): string {
  return `${nomor.trim().toLowerCase()}@armi.local`;
}

const ALNUM = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
export function generatePassword(length = 8): string {
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => ALNUM[b % ALNUM.length]).join("");
}

export const LOGIN_ERRORS = {
  kosong: "Nomor anggota dan password wajib diisi",
  salah: "Nomor anggota atau password salah",
  nonaktif: "Akun non-aktif, hubungi admin",
} as const;

export function validateLoginInput(nomor: string, password: string): string | null {
  if (!nomor.trim() || !password) return LOGIN_ERRORS.kosong;
  return null;
}

export function validateTransaksi(input: { kategori?: string; nominal: number }): string | null {
  if (!input.kategori) return "Kategori wajib dipilih";
  if (!(input.nominal > 0)) return "Nominal harus lebih besar dari 0";
  return null;
}

export function formatRupiah(n: number): string {
  return "Rp " + new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(n);
}

export function formatTanggal(d: string | Date): string {
  const date = typeof d === "string" ? new Date(d.length === 10 ? d + "T00:00:00" : d) : d;
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "long", year: "numeric" }).format(date);
}

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
