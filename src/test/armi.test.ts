import { describe, expect, it } from "vitest";
import {
  formatNomor, generatePassword, NOMOR_REGEX, validateLoginInput, validateTransaksi,
  formatRupiah, nomorToEmail, WILAYAH_JABAR, LOGIN_ERRORS,
} from "@/lib/armi";

describe("aturan ARMI", () => {
  it("nomor anggota berformat ARMI-JBR-XXXX", () => {
    expect(formatNomor(12)).toBe("ARMI-JBR-0012");
    expect(NOMOR_REGEX.test(formatNomor(1))).toBe(true);
  });
  it("password 8 karakter alfanumerik", () => {
    const p = generatePassword();
    expect(p).toHaveLength(8);
    expect(/^[A-Za-z0-9]+$/.test(p)).toBe(true);
  });
  it("login kosong ditolak dengan pesan PRD", () => {
    expect(validateLoginInput("", "x")).toBe(LOGIN_ERRORS.kosong);
    expect(validateLoginInput("ARMI-JBR-0001", "")).toBe("Nomor anggota dan password wajib diisi");
  });
  it("nominal harus > 0 dan kategori wajib", () => {
    expect(validateTransaksi({ kategori: "KAS", nominal: 0 })).toBe("Nominal harus lebih besar dari 0");
    expect(validateTransaksi({ kategori: "", nominal: 100 })).toBe("Kategori wajib dipilih");
    expect(validateTransaksi({ kategori: "KAS", nominal: 1 })).toBeNull();
  });
  it("format rupiah dan email login", () => {
    expect(formatRupiah(1000000)).toBe("Rp 1.000.000");
    expect(nomorToEmail("ARMI-JBR-0001")).toBe("armi-jbr-0001@armi.local");
  });
  it("27 wilayah Jawa Barat", () => {
    expect(WILAYAH_JABAR).toHaveLength(27);
  });
});
