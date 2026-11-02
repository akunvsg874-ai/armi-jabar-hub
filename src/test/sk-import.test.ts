import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseSkText, parseTanggal, SK_TXT_CONTOH } from "@/lib/sk-import";

const SAMPLE = `SURAT KEPUTUSAN KETUA ARMI
DEWAN PIMPINAN DAERAH JAWA BARAT
Nomor : 41731/XXX/ARMI-DPD/IX/2026
TENTANG PENGANGKATAN SEKRETARIS
DEWAN PIMPINAN DAERAH JAWA BARAT
KETUA ARMI DPD JAWA BARAT
Menimbang : a. Bahwa untuk mengisi kekosongan pemangku jabatan Sekretaris
Daerah di tingkat Dewan Pimpinan Daerah Jawa Barat maka
diperlukan penunjukan secepatnya
b. Bahwa perlu ditetapkannya dengan keputusan Ketua ARMI DPD
Jawa Barat
Mengingat : a. Anggaran Dasar ARMI BAB VI Pasal 1 tentang Struktur Organisasi
b. Anggaran Rumah Tangga ARMI BAB V Pasal 3 Tentang Susunan
Pimpinan Cabang
MEMUTUSKAN
Menetapkan :
Pertama : Mengangkat Sdr. R. ASEP MARTIN. K sebagai Sekretaris Daerah ARMI
di tingkat Dewan Pimpinan Daerah Jawa Barat
Kedua : Keputusan ini berlaku pada tanggal ditetapkan dan apabila dikemudian
hari terdapat kekeliruan akan dilakukan perbaikan sebagaimana
mestinya
Ditetapkan di : Kota Tasikmalaya, Jawa Barat
Pada Tangga : 30 September 2026
plt. Ketua DPD ARMI Jawa Barat
(ditandatangani secara elektronik)
Ikhsan Sonia Fadly, S.sos
`;

describe("Impor SK dari notepad", () => {
  it("membaca SK yang diketik seperti dokumen cetak", () => {
    const [sk] = parseSkText(SAMPLE);
    expect(sk).toEqual({
      nomor: "41731/XXX/ARMI-DPD/IX/2026",
      tentang: "PENGANGKATAN SEKRETARIS\nDEWAN PIMPINAN DAERAH JAWA BARAT",
      menimbang: [
        "Bahwa untuk mengisi kekosongan pemangku jabatan Sekretaris Daerah di tingkat Dewan Pimpinan Daerah Jawa Barat maka diperlukan penunjukan secepatnya",
        "Bahwa perlu ditetapkannya dengan keputusan Ketua ARMI DPD Jawa Barat",
      ],
      mengingat: ["Anggaran Dasar ARMI BAB VI Pasal 1 tentang Struktur Organisasi", "Anggaran Rumah Tangga ARMI BAB V Pasal 3 Tentang Susunan Pimpinan Cabang"],
      diktum_lain: ["Keputusan ini berlaku pada tanggal ditetapkan dan apabila dikemudian hari terdapat kekeliruan akan dilakukan perbaikan sebagaimana mestinya"],
      nama_penerima: "R. ASEP MARTIN. K",
      jabatan: "Sekretaris Daerah",
      tingkat: "Dewan Pimpinan Daerah Jawa Barat",
      ditetapkan_di: "Kota Tasikmalaya, Jawa Barat",
      tanggal_ditetapkan: "2026-09-30",
      jabatan_penandatangan: "plt. Ketua DPD ARMI Jawa Barat",
      nama_penandatangan: "Ikhsan Sonia Fadly, S.sos",
    });
  });
  it("satu file berisi banyak SK dipisah per judul SURAT KEPUTUSAN", () => {
    expect(parseSkText(SAMPLE + "\n\n" + SK_TXT_CONTOH).map((s) => s.nama_penerima)).toEqual(["R. ASEP MARTIN. K", "IKHSAN NURDIEN, S.T"]);
  });
  it("file SK dari abang terbaca 6 SK lengkap", () => {
    let txt = "";
    try { txt = readFileSync("/mnt/user-uploads/upload_SK.txt", "utf8"); } catch { return; }
    const all = parseSkText(txt);
    expect(all).toHaveLength(6);
    for (const s of all) {
      expect(s.nama_penerima && s.jabatan && s.nomor && s.tanggal_ditetapkan && s.nama_penandatangan).toBeTruthy();
      expect(s.mengingat).toHaveLength(3);
    }
  });
  it("format tanggal umum", () => {
    expect(parseTanggal("02/11/2026")).toBe("2026-11-02");
    expect(parseTanggal("17 Oktober 2026")).toBe("2026-10-17");
    expect(parseTanggal("besok")).toBeNull();
  });
});
