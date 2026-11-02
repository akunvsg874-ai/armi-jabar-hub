import type { SkData } from "./sk";

/** Fields an SK notepad (.txt) file can fill; anything missing keeps the form default. */
export type SkImport = Partial<Pick<SkData, "nomor" | "nama_penerima" | "jabatan" | "tingkat" | "tentang" | "menimbang" | "mengingat" | "diktum_lain"
  | "ditetapkan_di" | "tanggal_ditetapkan" | "jabatan_penandatangan" | "nama_penandatangan">>;
type Key = keyof SkImport | "nomor_anggota";

const KEYS: Record<string, Key> = {
  nomor: "nomor", nomorsk: "nomor", nosk: "nomor", nomorsurat: "nomor",
  nama: "nama_penerima", namapenerima: "nama_penerima", penerima: "nama_penerima",
  jabatan: "jabatan", tingkat: "tingkat", ditingkat: "tingkat",
  tentang: "tentang", menimbang: "menimbang", mengingat: "mengingat",
  diktum: "diktum_lain", diktumlain: "diktum_lain", memutuskan: "diktum_lain", menetapkan: "diktum_lain",
  ditetapkandi: "ditetapkan_di", tempat: "ditetapkan_di",
  tanggal: "tanggal_ditetapkan", padatanggal: "tanggal_ditetapkan", tanggalditetapkan: "tanggal_ditetapkan",
  jabatanpenandatangan: "jabatan_penandatangan", namapenandatangan: "nama_penandatangan", penandatangan: "nama_penandatangan",
  nomoranggota: "nomor_anggota", noanggota: "nomor_anggota",
};
const LIST_KEYS = new Set<Key>(["menimbang", "mengingat", "diktum_lain"]);
const BULLET = /^(?:[-*•]|[a-zA-Z0-9]{1,2}[.)])\s+(.*)$/;
const BULAN = ["januari", "februari", "maret", "april", "mei", "juni", "juli", "agustus", "september", "oktober", "november", "desember"];

const pad = (n: number) => String(n).padStart(2, "0");

/** Accepts 2026-11-02, 02-11-2026, 02/11/2026 or "2 November 2026"; returns YYYY-MM-DD or null. */
export function parseTanggal(s: string): string | null {
  const t = s.trim().toLowerCase();
  let m = t.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (m) return `${m[1]}-${pad(+m[2]!)}-${pad(+m[3]!)}`;
  m = t.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (m) return `${m[3]}-${pad(+m[2]!)}-${pad(+m[1]!)}`;
  m = t.match(/^(\d{1,2})\s+([a-z]+)\s+(\d{4})$/);
  if (m) {
    const b = BULAN.findIndex((x) => x.startsWith(m![2]!.slice(0, 3)));
    if (b >= 0) return `${m[3]}-${pad(b + 1)}-${pad(+m[1]!)}`;
  }
  return null;
}

/** Parses "Label: isi" lines; Menimbang/Mengingat/Diktum take one bullet ("- ", "a.", "1.") per point. */
export function parseSkText(text: string): { data: SkImport; nomorAnggota: string; unknown: string[]; badDate: string } {
  const data: SkImport = {};
  const scalars: Partial<Record<Key, string[]>> = {};
  const lists: Partial<Record<Key, string[]>> = {};
  const unknown: string[] = [];
  let cur: Key | null = null;

  for (const raw of text.replace(/^\uFEFF/, "").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const km = line.match(/^([A-Za-z][A-Za-z .\/]{0,40}?)\s*[:=]\s*(.*)$/);
    const key = km ? KEYS[km[1]!.toLowerCase().replace(/[^a-z]/g, "")] : undefined;
    if (km && key) {
      cur = key;
      const rest = km[2]!.trim();
      if (LIST_KEYS.has(key)) { lists[key] = []; if (rest) lists[key]!.push(rest.match(BULLET)?.[1] ?? rest); }
      else scalars[key] = rest ? [rest] : [];
      continue;
    }
    if (!cur) { if (km) unknown.push(km[1]!.trim()); continue; }
    if (LIST_KEYS.has(cur)) {
      const items = lists[cur]!;
      const b = line.match(BULLET);
      if (b || !items.length) items.push(b ? b[1]! : line);
      else items[items.length - 1] += " " + line;
    } else scalars[cur]!.push(line);
  }

  let badDate = "";
  for (const [k, v] of Object.entries(scalars) as [Key, string[]][]) {
    if (k === "nomor_anggota" || !v.length) continue;
    const val = k === "tentang" ? v.join("\n") : v.join(" ");
    if (k === "tanggal_ditetapkan") { const d = parseTanggal(val); if (d) data.tanggal_ditetapkan = d; else badDate = val; }
    else (data as Record<string, string>)[k] = val;
  }
  for (const [k, v] of Object.entries(lists) as [Key, string[]][]) {
    const items = v.map((x) => x.trim()).filter(Boolean);
    if (items.length) (data as Record<string, string[]>)[k] = items;
  }
  return { data, nomorAnggota: (scalars.nomor_anggota ?? []).join(" ").trim(), unknown, badDate };
}

export const SK_TXT_CONTOH = `# Contoh file SK untuk diimpor ke Generate SK.
# Format: Label: isi. Baris diawali # diabaikan. Kolom yang tidak ditulis memakai isi bawaan.
# Nomor SK boleh dikosongkan, nanti diisi nomor urut berikutnya.

Nomor SK:
Nomor Anggota: 05.2024.06.06.0122
Nama Penerima: IKHSAN NURDIEN, S.T
Jabatan: Koordinator Keanggotaan
Tingkat: Dewan Pimpinan Daerah Jawa Barat
Tentang:
PENGANGKATAN KOORDINATOR KEANGGOTAAN
DEWAN PIMPINAN DAERAH JAWA BARAT

Menimbang:
a. Bahwa untuk mengisi kekosongan pemangku jabatan Koordinator Keanggotaan di tingkat Dewan Pimpinan Daerah Jawa Barat maka diperlukan penunjukan secepatnya
b. Bahwa perlu ditetapkannya dengan keputusan Ketua ARMI DPD Jawa Barat

Mengingat:
a. Anggaran Dasar ARMI BAB VI Pasal 1 tentang Struktur Organisasi
b. Anggaran Rumah Tangga ARMI BAB V Pasal 3 Tentang Susunan Pimpinan Cabang

# Diktum Pertama dibuat otomatis. Tulis mulai diktum Kedua.
Diktum:
- Keputusan ini berlaku pada tanggal ditetapkan dan apabila dikemudian hari terdapat kekeliruan akan dilakukan perbaikan sebagaimana mestinya

Ditetapkan di: Kota Tasikmalaya, Jawa Barat
Tanggal: 2 November 2026
Jabatan Penandatangan: plt. Ketua DPD ARMI Jawa Barat
Nama Penandatangan: Ikhsan Sonia Fadly, S.sos
`;
