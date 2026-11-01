import { queryOptions } from "@tanstack/react-query";
import type { Database } from "@/integrations/supabase/types";
import { getHalaman, listArtikel, getArtikel, listGaleri } from "./cms.functions";

export type HalamanRow = Database["public"]["Tables"]["halaman"]["Row"];
export type Section = { judul: string; isi: string; gambar?: string; label?: string; sub?: string };

/** Beranda uses fixed konten slots: 0 = section "Bukan Sekadar Jaringan Usaha" (foto), 1 = section "Jaringan Kita". */
export const BERANDA_JARINGAN: Section = {
  label: "Jaringan Kita",
  judul: "Di Seluruh\n*Jawa Barat*",
  sub: "27 kabupaten/kota, satu tujuan",
  isi: "Temukan anggota ARMI berdasarkan wilayah dan kenali jaringan usaha rental mobil di Jawa Barat.",
};

export type Halaman = {
  slug: string; label: string;
  seo_title: string; seo_description: string; og_image: string;
  hero_eyebrow: string; hero_title: string; hero_desc: string; hero_image: string;
  konten: Section[];
  /** Hint for admins on what the sections are used for on this page. */
  kontenHint: string;
};

const d = (slug: string, label: string, seo_title: string, seo_description: string, hero_eyebrow: string, hero_title: string, hero_desc: string, konten: Section[] = [], kontenHint = "Section tambahan halaman"): Halaman =>
  ({ slug, label, seo_title, seo_description, og_image: "", hero_eyebrow, hero_title, hero_desc, hero_image: "", konten, kontenHint });

export const HALAMAN_DEFAULT: Record<string, Halaman> = {
  beranda: d("beranda", "Beranda", "ARMI DPD Jawa Barat — Satu Jaringan, Satu Semangat",
    "Ruang kolaborasi pengusaha rental mobil Jawa Barat untuk memperkuat jaringan, membangun kepercayaan, dan meningkatkan profesionalitas.",
    "Wadah Resmi Pengusaha Rental Mobil Jawa Barat", "Satu Jaringan. *Satu Semangat.*\nTumbuh Bersama.", "Ruang kolaborasi pengusaha rental mobil Jawa Barat untuk memperkuat jaringan, membangun kepercayaan, dan meningkatkan profesionalitas bersama.",
    [{ judul: "Tentang Komunitas", isi: "", gambar: "" }, BERANDA_JARINGAN], "Slot tetap beranda"),
  tentang: d("tentang", "Tentang Kami", "Tentang Kami — ARMI DPD Jawa Barat", "Profil, visi, dan misi DPD Anggota Rental Mobil Indonesia Jawa Barat.",
    "Tentang Kami", "Mengenal ARMI DPD Jawa Barat", "Wadah resmi para pengusaha rental mobil di Jawa Barat, berlandaskan Tri Arutala — Kebersamaan, Keamanan, Professionalitas.",
    [
      { judul: "Siapa Kami", isi: "ARMI (Anggota Rental Mobil Indonesia) DPD Jawa Barat menghubungkan pengusaha rental mobil untuk saling melindungi, berbagi informasi, dan tumbuh bersama sebagai pelaku usaha yang profesional." },
      { judul: "Visi", isi: "Menjadi organisasi rental mobil yang solid, aman, dan profesional." },
      { judul: "Misi", isi: "Menjaga keamanan armada anggota melalui jaringan Pandawa Korlap dan data blacklist konsumen.\nMempererat kebersamaan antar pengusaha rental di Jawa Barat.\nMeningkatkan profesionalitas dan legalitas usaha rental mobil.\nMembangun kemitraan strategis dengan berbagai pihak." },
    ], "Blok profil (judul, isi per baris, foto opsional)"),
  galeri: d("galeri", "Galeri", "Galeri — ARMI DPD Jawa Barat", "Dokumentasi kegiatan dan kebersamaan komunitas ARMI DPD Jawa Barat.",
    "Komunitas", "Galeri Kebersamaan", "Momen konvoi, kopdar, aksi sosial, dan perjalanan komunitas ARMI Jawa Barat."),
  anggota: d("anggota", "Cari Anggota", "Cari Anggota — ARMI DPD Jawa Barat", "Verifikasi rental mobil resmi anggota ARMI Jawa Barat berdasarkan nama, usaha, atau wilayah.",
    "Komunitas", "Jaringan Anggota ARMI", "Temukan pelaku usaha rental mobil dalam jaringan ARMI DPD Jawa Barat."),
  gabung: d("gabung", "Gabung Menjadi Anggota", "Gabung Menjadi Anggota — ARMI DPD Jawa Barat", "Daftar menjadi anggota ARMI DPD Jawa Barat dan bergabung dengan jaringan pengusaha rental mobil terpercaya.",
    "Komunitas", "Gabung Menjadi Anggota", "Isi formulir pendaftaran. Sekretariat akan menghubungi Anda untuk verifikasi sebelum nomor anggota diterbitkan.",
    [
      { judul: "Perlindungan Armada", isi: "Akses jaringan Pandawa Korlap dan data blacklist konsumen." },
      { judul: "Jaringan Se-Jawa Barat", isi: "Berbagi unit, order, dan pengemudi dengan sesama anggota." },
      { judul: "Legalitas & Kemitraan", isi: "Pendampingan legalitas usaha dan kemitraan strategis." },
    ], "Keuntungan menjadi anggota"),
  agenda: d("agenda", "Agenda", "Agenda Kegiatan — ARMI DPD Jawa Barat", "Agenda sosial, kopdar, dan anniversary DPD ARMI Jawa Barat.",
    "Kegiatan", "Agenda Kegiatan", "Kegiatan sosial, kopdar, dan anniversary DPD ARMI Jawa Barat."),
  "jadwal-eksekusi": d("jadwal-eksekusi", "Jadwal Eksekusi", "Jadwal Eksekusi — ARMI DPD Jawa Barat", "Jadwal kegiatan eksekusi dan penanganan unit bermasalah DPD ARMI Jawa Barat.",
    "Kegiatan", "Jadwal Eksekusi", "Jadwal penanganan unit bermasalah bersama tim Pandawa Korlap."),
  artikel: d("artikel", "Artikel", "Artikel — ARMI DPD Jawa Barat", "Berita, tips usaha rental, dan kabar terbaru dari DPD ARMI Jawa Barat.",
    "Artikel", "Kabar & Wawasan", "Berita organisasi, tips usaha rental, dan cerita dari komunitas."),
  kontak: d("kontak", "Kontak", "Kontak — ARMI DPD Jawa Barat", "Hubungi sekretariat DPD ARMI Jawa Barat untuk informasi keanggotaan dan kerja sama.",
    "Kontak", "Hubungi Sekretariat", "Hubungi kami untuk informasi keanggotaan, kerja sama, maupun laporan.",
    [
      { judul: "Sekretariat", isi: "Jl. Contoh No. 1, Kota Bandung, Jawa Barat" },
      { judul: "Telepon / WhatsApp", isi: "0812-0000-0000" },
      { judul: "Email", isi: "sekretariat@armijabar.id" },
    ], "Info kontak (judul = label, isi = nilai)"),
};

/** Merge a stored row over defaults; empty stored fields fall back. */
export const defaultHalaman = (slug: string): Halaman => HALAMAN_DEFAULT[slug] ?? { ...HALAMAN_DEFAULT["beranda"]!, slug, label: slug };
export const SLUGS = Object.keys(HALAMAN_DEFAULT);

/** Fixed-slot konten: each slot keeps its position; empty stored fields fall back to the default slot. */
export function mergeSlots(base: Section[], stored: Section[]): Section[] {
  const len = Math.max(base.length, stored.length);
  return Array.from({ length: len }, (_, i) => {
    const b = base[i] ?? { judul: "", isi: "" };
    const s = stored[i] ?? ({} as Partial<Section>);
    const out: Section = { ...b };
    (Object.keys(s) as (keyof Section)[]).forEach((k) => {
      const v = s[k];
      if (typeof v === "string" && v.trim()) out[k] = v;
    });
    return out;
  });
}

export function mergeHalaman(slug: string, row: HalamanRow | null): Halaman {
  const base = defaultHalaman(slug);
  if (!row) return base;
  const pick = (k: keyof HalamanRow & keyof Halaman) => ((row[k] as string | null)?.trim() ? (row[k] as string) : (base[k] as string));
  const stored = Array.isArray(row.konten) ? (row.konten as unknown as Section[]) : [];
  const konten = slug === "beranda"
    ? mergeSlots(base.konten, stored)
    : stored.length ? stored : base.konten;
  return {
    ...base,
    seo_title: pick("seo_title"), seo_description: pick("seo_description"), og_image: pick("og_image"),
    hero_eyebrow: pick("hero_eyebrow"), hero_title: pick("hero_title"), hero_desc: pick("hero_desc"), hero_image: pick("hero_image"),
    konten,
  };
}

export const halamanQuery = (slug: string) =>
  queryOptions({ queryKey: ["halaman", slug], queryFn: async () => mergeHalaman(slug, await getHalaman({ data: { slug } })) });
export const artikelListQuery = queryOptions({ queryKey: ["artikel-publik"], queryFn: () => listArtikel() });
export const artikelQuery = (slug: string) => queryOptions({ queryKey: ["artikel", slug], queryFn: () => getArtikel({ data: { slug } }) });
export const galeriQuery = queryOptions({ queryKey: ["galeri"], queryFn: () => listGaleri() });

/** Builds head() meta for a CMS page. og:image only when an absolute URL is set. */
export function seoMeta(h: Halaman | undefined, fallbackSlug: string) {
  const p = h ?? defaultHalaman(fallbackSlug);
  const meta: Array<Record<string, string>> = [
    { title: p.seo_title },
    { name: "description", content: p.seo_description },
    { property: "og:title", content: p.seo_title },
    { property: "og:description", content: p.seo_description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ];
  if (/^https:\/\//.test(p.og_image)) meta.push({ property: "og:image", content: p.og_image }, { name: "twitter:image", content: p.og_image });
  return { meta };
}

export function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 120);
}
