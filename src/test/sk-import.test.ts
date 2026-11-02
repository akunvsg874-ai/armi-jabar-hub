import { describe, expect, it } from "vitest";
import { parseSkText, parseTanggal, SK_TXT_CONTOH } from "@/lib/sk-import";

describe("Impor SK dari notepad", () => {
  it("membaca contoh file lengkap", () => {
    const { data, nomorAnggota, unknown } = parseSkText(SK_TXT_CONTOH);
    expect(data.nama_penerima).toBe("IKHSAN NURDIEN, S.T");
    expect(data.tentang).toBe("PENGANGKATAN KOORDINATOR KEANGGOTAAN\nDEWAN PIMPINAN DAERAH JAWA BARAT");
    expect(data.menimbang).toHaveLength(2);
    expect(data.mengingat?.[1]).toBe("Anggaran Rumah Tangga ARMI BAB V Pasal 3 Tentang Susunan Pimpinan Cabang");
    expect(data.diktum_lain).toHaveLength(1);
    expect(data.tanggal_ditetapkan).toBe("2026-11-02");
    expect(data.nomor).toBeUndefined();
    expect(nomorAnggota).toBe("05.2024.06.06.0122");
    expect(unknown).toEqual([]);
  });
  it("baris lanjutan menyambung poin sebelumnya", () => {
    const { data } = parseSkText("Menimbang:\n- Bahwa satu\n  lanjutan\n- Bahwa dua");
    expect(data.menimbang).toEqual(["Bahwa satu lanjutan", "Bahwa dua"]);
  });
  it("format tanggal umum", () => {
    expect(parseTanggal("02/11/2026")).toBe("2026-11-02");
    expect(parseTanggal("2026-11-02")).toBe("2026-11-02");
    expect(parseTanggal("17 Oktober 2026")).toBe("2026-10-17");
    expect(parseTanggal("besok")).toBeNull();
  });
});
