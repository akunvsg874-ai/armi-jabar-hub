import type { SkData } from "./sk";

/** Fields read from an SK typed in notepad; anything missing keeps the form default. */
export type SkImport = Partial<Pick<SkData, "nomor" | "nama_penerima" | "jabatan" | "tingkat" | "tentang" | "menimbang" | "mengingat" | "diktum_lain"
  | "ditetapkan_di" | "tanggal_ditetapkan" | "jabatan_penandatangan" | "nama_penandatangan">>;

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

const HEADER = /^SURAT\s+KEPUTUSAN\s+KETUA\s+ARMI/i;
const DIKTUM = /^(Pertama|Kedua|Ketiga|Keempat|Kelima|Keenam|Ketujuh|Kedelapan|Kesembilan|Kesepuluh)\s*:\s*(.*)$/i;
const LETTER = /^[a-z][.)]\s+(.*)$/i;
const PERTAMA = /Mengangkat\s+(?:Sdr\.?|Sdri\.?|Saudara|Saudari)?\s*(.+?)\s+sebagai\s+(.+?)(?:\s+ARMI)?\s+di\s+tingkat\s+(.+?)\.?$/i;

/** Parses one block written like the printed SK (Nomor :, TENTANG, Menimbang : a., Pertama :, Pada Tanggal :, signer). */
function parseBlock(lines: string[]): SkImport {
  const d: SkImport = {};
  const tentang: string[] = [];
  const lists = { menimbang: [] as string[], mengingat: [] as string[], diktum: [] as string[] };
  let pertama = "";
  let mode: "" | "tentang" | "menimbang" | "mengingat" | "pertama" | "diktum" | "ttd" = "";
  const ttd: string[] = [];
  const push = (arr: string[], s: string, newItem: boolean) => {
    if (newItem || !arr.length) arr.push(s); else arr[arr.length - 1] += " " + s;
  };

  for (const line of lines) {
    let m: RegExpMatchArray | null;
    if (/^DEWAN PIMPINAN DAERAH/i.test(line) && mode === "") continue;
    if ((m = line.match(/^Nomor\s*:\s*(.+)$/i))) { d.nomor = m[1]!.trim(); mode = ""; continue; }
    if ((m = line.match(/^TENTANG\b\s*:?\s*(.*)$/i))) { mode = "tentang"; if (m[1]) tentang.push(m[1].trim()); continue; }
    if (/^KETUA\s+ARMI\s+DPD/i.test(line) && mode === "tentang") { mode = ""; continue; }
    if ((m = line.match(/^(Menimbang|Mengingat)\s*:\s*(.*)$/i))) {
      mode = m[1]!.toLowerCase() as "menimbang" | "mengingat";
      const rest = m[2]!.trim();
      if (rest) push(lists[mode], rest.match(LETTER)?.[1] ?? rest, true);
      continue;
    }
    if (/^(MEMUTUSKAN|Menetapkan\s*:?)$/i.test(line)) { mode = ""; continue; }
    if ((m = line.match(DIKTUM))) {
      if (m[1]!.toLowerCase() === "pertama") { mode = "pertama"; pertama = m[2]!.trim(); }
      else { mode = "diktum"; push(lists.diktum, m[2]!.trim(), true); }
      continue;
    }
    if ((m = line.match(/^Ditetapkan\s+di\s*:\s*(.+)$/i))) { d.ditetapkan_di = m[1]!.trim(); mode = ""; continue; }
    if ((m = line.match(/^Pada\s+Tangg?al?\w*\s*:\s*(.+)$/i))) {
      const t = parseTanggal(m[1]!); if (t) d.tanggal_ditetapkan = t;
      mode = "ttd"; continue;
    }
    if (mode === "tentang") tentang.push(line);
    else if (mode === "menimbang" || mode === "mengingat") { const b = line.match(LETTER); push(lists[mode], b ? b[1]! : line, !!b); }
    else if (mode === "pertama") pertama += " " + line;
    else if (mode === "diktum") push(lists.diktum, line, false);
    else if (mode === "ttd" && !/^\(.*\)$/.test(line)) ttd.push(line);
  }

  if (tentang.length) d.tentang = tentang.join("\n").toUpperCase();
  if (lists.menimbang.length) d.menimbang = lists.menimbang;
  if (lists.mengingat.length) d.mengingat = lists.mengingat;
  if (lists.diktum.length) d.diktum_lain = lists.diktum;
  const p = pertama.replace(/\s+/g, " ").trim().match(PERTAMA);
  if (p) { d.nama_penerima = p[1]!.trim(); d.jabatan = p[2]!.trim(); d.tingkat = p[3]!.trim(); }
  if (ttd.length >= 2) { d.jabatan_penandatangan = ttd[0]!; d.nama_penandatangan = ttd[ttd.length - 1]!; }
  else if (ttd.length === 1) d.nama_penandatangan = ttd[0]!;
  return d;
}

/** Splits a notepad text into SKs (each starts with "SURAT KEPUTUSAN KETUA ARMI") and parses each one. */
export function parseSkText(text: string): SkImport[] {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).map((l) => l.replace(/\s+/g, " ").trim()).filter(Boolean);
  const blocks: string[][] = [];
  for (const l of lines) {
    if (HEADER.test(l) || !blocks.length) blocks.push([]);
    if (!HEADER.test(l)) blocks[blocks.length - 1]!.push(l);
  }
  return blocks.map(parseBlock).filter((d) => d.nama_penerima || d.nomor);
}

export const SK_TXT_CONTOH = `SURAT KEPUTUSAN KETUA ARMI
DEWAN PIMPINAN DAERAH JAWA BARAT
Nomor : 41736/XVII/ARMI-DPD/X/2026
TENTANG PENGANGKATAN KOORDINATOR KEANGGOTAAN
DEWAN PIMPINAN DAERAH JAWA BARAT
KETUA ARMI DPD JAWA BARAT
Menimbang : a. Bahwa untuk mengisi kekosongan pemangku jabatan Koordinator Keanggotaan di tingkat Dewan Pimpinan Daerah Jawa Barat maka diperlukan penunjukan secepatnya
b. Bahwa perlu ditetapkannya dengan keputusan Ketua ARMI DPD Jawa Barat
Mengingat : a. Anggaran Dasar ARMI BAB VI Pasal 1 tentang Struktur Organisasi
b. Anggaran Rumah Tangga ARMI BAB V Pasal 3 Tentang Susunan Pimpinan Cabang
c. Kewenangan penuh berdasarkan Surat Penunjukan Antar Waktu Ketua Harian DPD Jawa Barat No. 01/022092026/dpdjabar
MEMUTUSKAN
Menetapkan :
Pertama : Mengangkat Sdr. IKHSAN NURDIEN, S.T sebagai Koordinator Keanggotaan ARMI di tingkat Dewan Pimpinan Daerah Jawa Barat
Kedua : Keputusan ini berlaku pada tanggal ditetapkan dan apabila dikemudian hari terdapat kekeliruan akan dilakukan perbaikan sebagaimana mestinya
Ditetapkan di : Kota Tasikmalaya, Jawa Barat
Pada Tanggal : 17 Oktober 2026
plt. Ketua DPD ARMI Jawa Barat
(ditandatangani secara elektronik)
Ikhsan Sonia Fadly, S.sos
`;
