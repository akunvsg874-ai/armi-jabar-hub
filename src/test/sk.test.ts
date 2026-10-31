import { describe, expect, it } from "vitest";
import { nextUrut, skVerifyUrl, suggestNomor } from "@/lib/sk";

describe("SK", () => {
  it("nomor SK mengikuti pola template", () => {
    expect(suggestNomor(41736, "2026-10-17")).toBe("41736/XVII/ARMI-DPD/X/2026");
  });
  it("nomor urut berikutnya = tertinggi + 1", () => {
    expect(nextUrut(["41736/XVII/ARMI-DPD/X/2026", "41740/XVII/ARMI-DPD/XI/2026"])).toBe(41741);
  });
  it("QR selalu mengarah ke dpdarmijabar.com", () => {
    expect(skVerifyUrl("abc123")).toBe("https://dpdarmijabar.com/verifikasi-sk/abc123");
  });
});
