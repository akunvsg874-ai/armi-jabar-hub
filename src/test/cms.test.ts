import { describe, expect, it } from "vitest";
import { mergeHalaman, BERANDA_JARINGAN } from "@/lib/cms";

const row = (konten: unknown) => ({
  slug: "beranda", seo_title: null, seo_description: null, og_image: null, hero_eyebrow: null,
  hero_title: null, hero_desc: null, hero_image: null, konten: konten as never, updated_at: "",
});

describe("beranda section Jaringan Kita", () => {
  it("memakai teks bawaan jika belum diisi admin", () => {
    const h = mergeHalaman("beranda", row([{ judul: "Tentang Komunitas", isi: "", gambar: "x.jpg" }]));
    expect(h.konten[0]?.gambar).toBe("x.jpg");
    expect(h.konten[1]?.judul).toBe(BERANDA_JARINGAN.judul);
  });
  it("teks yang diubah admin tampil, kolom kosong kembali ke bawaan", () => {
    const h = mergeHalaman("beranda", row([{ judul: "", isi: "" }, { judul: "Se-*Jabar*", isi: "", sub: "32 wilayah" }]));
    expect(h.konten[1]?.judul).toBe("Se-*Jabar*");
    expect(h.konten[1]?.sub).toBe("32 wilayah");
    expect(h.konten[1]?.isi).toBe(BERANDA_JARINGAN.isi);
  });
});
