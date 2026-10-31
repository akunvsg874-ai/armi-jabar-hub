import { todayISO } from "./armi";

/** QR codes on every SK always point at the official site, whatever host generated the SK. */
export const SK_SITE_URL = "https://dpdarmijabar.com";

export function skVerifyUrl(kode: string): string {
  return `${SK_SITE_URL}/verifikasi-sk/${kode}`;
}

export const DIKTUM_LABEL = ["Pertama", "Kedua", "Ketiga", "Keempat", "Kelima", "Keenam", "Ketujuh", "Kedelapan", "Kesembilan", "Kesepuluh"];
export const diktumLabel = (i: number) => DIKTUM_LABEL[i] ?? `Ke-${i + 1}`;

const ROMAN: [number, string][] = [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
export function toRoman(n: number): string {
  let out = "";
  for (const [v, s] of ROMAN) while (n >= v) { out += s; n -= v; }
  return out;
}

/** Suggested SK number in the template's pattern: <urut>/XVII/ARMI-DPD/<bulan romawi>/<tahun>. */
export function suggestNomor(urut: number, tanggalISO: string = todayISO()): string {
  const [y = 2026, m = 1] = tanggalISO.split("-").map(Number);
  return `${urut}/XVII/ARMI-DPD/${toRoman(m)}/${y}`;
}

/** Highest leading sequence among existing SK numbers + 1 (starts after the template's 41736). */
export function nextUrut(nomors: string[]): number {
  const nums = nomors.map((n) => parseInt(n.split("/")[0] ?? "", 10)).filter((n) => Number.isFinite(n));
  return nums.length ? Math.max(...nums) + 1 : 41737;
}

export function diktumPertama(nama: string, jabatan: string, tingkat: string): string {
  return `Mengangkat Sdr. ${nama || "…"} sebagai ${jabatan || "…"} ARMI di tingkat ${tingkat || "…"}`;
}

export type SkData = {
  kode: string;
  nomor: string;
  tentang: string;
  nama_penerima: string;
  jabatan: string;
  tingkat: string;
  menimbang: string[];
  mengingat: string[];
  diktum_lain: string[];
  ditetapkan_di: string;
  tanggal_ditetapkan: string;
  jabatan_penandatangan: string;
  nama_penandatangan: string;
  ttd_url: string | null;
  status: "aktif" | "dicabut";
};

export function asList(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

export function defaultSk(jabatan = "Koordinator Keanggotaan", tingkat = "Dewan Pimpinan Daerah Jawa Barat"): Omit<SkData, "kode" | "nomor" | "status"> {
  return {
    tentang: `PENGANGKATAN ${jabatan.toUpperCase()}\n${tingkat.toUpperCase()}`,
    nama_penerima: "",
    jabatan,
    tingkat,
    menimbang: [
      `Bahwa untuk mengisi kekosongan pemangku jabatan ${jabatan} di tingkat ${tingkat} maka diperlukan penunjukan secepatnya`,
      "Bahwa perlu ditetapkannya dengan keputusan Ketua ARMI DPD Jawa Barat",
    ],
    mengingat: [
      "Anggaran Dasar ARMI BAB VI Pasal 1 tentang Struktur Organisasi",
      "Anggaran Rumah Tangga ARMI BAB V Pasal 3 Tentang Susunan Pimpinan Cabang",
      "Kewenangan penuh berdasarkan Surat Penunjukan Antar Waktu Ketua Harian DPD Jawa Barat No. 01/022092026/dpdjabar",
    ],
    diktum_lain: ["Keputusan ini berlaku pada tanggal ditetapkan dan apabila dikemudian hari terdapat kekeliruan akan dilakukan perbaikan sebagaimana mestinya"],
    ditetapkan_di: "Kota Tasikmalaya, Jawa Barat",
    tanggal_ditetapkan: todayISO(),
    jabatan_penandatangan: "plt. Ketua DPD ARMI Jawa Barat",
    nama_penandatangan: "Ikhsan Sonia Fadly, S.sos",
    ttd_url: null,
  };
}

type SkRow = { kode: string; nomor: string; tentang: string; nama_penerima: string; jabatan: string; tingkat: string; menimbang: unknown; mengingat: unknown; diktum_lain: unknown;
  ditetapkan_di: string; tanggal_ditetapkan: string; jabatan_penandatangan: string; nama_penandatangan: string; ttd_url: string | null; status: string };
export function rowToSk(r: SkRow): SkData {
  return { ...r, menimbang: asList(r.menimbang), mengingat: asList(r.mengingat), diktum_lain: asList(r.diktum_lain), status: r.status === "dicabut" ? "dicabut" : "aktif" };
}
