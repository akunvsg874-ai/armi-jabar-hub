import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SLUGS, defaultHalaman, mergeHalaman, type Halaman, type Section } from "@/lib/cms";
import { PageTitle, Field, inputCls, btnPrimary, btnSecondary, btnDanger } from "@/components/portal/ui";
import { ImageInput } from "@/components/portal/ImageInput";
import type { Json } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/admin/halaman")({
  beforeLoad: ({ context }) => { if (context.me.role !== "admin") throw redirect({ to: "/dashboard" }); },
  head: () => ({ meta: [{ title: "Kelola Halaman — Portal ARMI Jabar" }, { name: "description", content: "Kelola konten, foto, dan SEO halaman website." }] }),
  component: Page,
});


function Page() {
  const qc = useQueryClient();
  const [slug, setSlug] = useState<string>("beranda");
  const { data: row, isLoading } = useQuery({
    queryKey: ["admin-halaman", slug],
    queryFn: async () => (await supabase.from("halaman").select("*").eq("slug", slug).maybeSingle()).data,
  });
  const [f, setF] = useState<Halaman>(defaultHalaman("beranda"));
  useEffect(() => { if (!isLoading) setF(mergeHalaman(slug, row ?? null)); }, [row, isLoading, slug]);
  const set = (k: keyof Halaman) => (v: string) => setF({ ...f, [k]: v });
  const txt = (k: keyof Halaman) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(k)(e.target.value);
  const setSec = (i: number, p: Partial<Section>) => setF({ ...f, konten: f.konten.map((s, j) => (j === i ? { ...s, ...p } : s)) });
  const move = (i: number, d: number) => { const k = [...f.konten]; const j = i + d; if (j < 0 || j >= k.length) return; const a = k[i]!; k[i] = k[j]!; k[j] = a; setF({ ...f, konten: k }); };

  async function save() {
    const { error } = await supabase.from("halaman").upsert({
      slug, seo_title: f.seo_title, seo_description: f.seo_description, og_image: f.og_image,
      hero_eyebrow: f.hero_eyebrow, hero_title: f.hero_title, hero_desc: f.hero_desc, hero_image: f.hero_image,
      konten: f.konten.filter((s) => s.judul.trim() || s.isi.trim() || (s.gambar ?? "").trim()) as unknown as Json, updated_at: new Date().toISOString(),
    });
    if (error) return void toast.error("Gagal menyimpan");
    toast.success("Halaman tersimpan");
    qc.invalidateQueries({ queryKey: ["admin-halaman", slug] });
    qc.invalidateQueries({ queryKey: ["halaman", slug] });
  }

  return (
    <>
      <PageTitle title="Kelola Halaman" desc="Ubah judul, foto, isi section, dan SEO setiap halaman website."
        action={<button className={btnPrimary} onClick={save}>Simpan Halaman</button>} />
      <div className="mb-6 flex flex-wrap gap-2">
        {SLUGS.map((s) => (
          <button key={s} onClick={() => setSlug(s)} className={s === slug ? btnPrimary : btnSecondary}>{defaultHalaman(s).label}</button>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-3 rounded-lg border border-border bg-card p-5">
          <h2 className="font-bold uppercase tracking-wider">Bagian Pembuka</h2>
          <Field label="Label kecil"><input className={inputCls} value={f.hero_eyebrow} onChange={txt("hero_eyebrow")} maxLength={120} /></Field>
          <Field label={slug === "beranda" ? "Judul (Enter = baris baru, *teks* = warna oranye)" : "Judul"}>{slug === "beranda" ? <textarea rows={3} className={inputCls} value={f.hero_title} onChange={txt("hero_title")} maxLength={160} /> : <input className={inputCls} value={f.hero_title} onChange={txt("hero_title")} maxLength={160} />}</Field>
          <Field label="Deskripsi"><textarea className={inputCls} rows={3} value={f.hero_desc} onChange={txt("hero_desc")} maxLength={600} /></Field>
          {slug !== "anggota" && <Field label="Foto latar"><ImageInput value={f.hero_image} onChange={set("hero_image")} /></Field>}
          {slug === "beranda" && <Field label={`Foto section "${f.konten[0]?.judul?.trim() || "Bukan Sekadar Jaringan Usaha"}"`}>
            <ImageInput value={f.konten[0]?.gambar ?? ""} onChange={(v) => {
              const k = [...f.konten];
              if (k[0]) k[0] = { ...k[0], gambar: v };
              else k[0] = { judul: "Tentang Komunitas", isi: "", gambar: v };
              setF({ ...f, konten: k });
            }} />
          </Field>}
        </div>
        <div className="space-y-3 rounded-lg border border-border bg-card p-5">
          <h2 className="font-bold uppercase tracking-wider">SEO</h2>
          <Field label={`Judul SEO (${f.seo_title.length}/60)`}><input className={inputCls} value={f.seo_title} onChange={txt("seo_title")} maxLength={90} /></Field>
          <Field label={`Deskripsi SEO (${f.seo_description.length}/160)`}><textarea className={inputCls} rows={3} value={f.seo_description} onChange={txt("seo_description")} maxLength={200} /></Field>
          <Field label="Gambar saat dibagikan (media sosial)"><ImageInput value={f.og_image} onChange={set("og_image")} /></Field>
        </div>
      </div>
      {slug !== "beranda" && (
        <div className="mt-6 space-y-3 rounded-lg border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <div><h2 className="font-bold uppercase tracking-wider">Isi Section</h2><p className="text-xs text-muted-foreground">{f.kontenHint}</p></div>
            <button className={btnSecondary} onClick={() => setF({ ...f, konten: [...f.konten, { judul: "", isi: "" }] })}><Plus className="h-4 w-4" /> Tambah</button>
          </div>
          {f.konten.length === 0 && <p className="text-sm text-muted-foreground">Belum ada section.</p>}
          {f.konten.map((s, i) => (
            <div key={i} className="space-y-2 rounded-md border border-border p-4">
              <div className="flex gap-2">
                <input className={inputCls} placeholder="Judul" value={s.judul} onChange={(e) => setSec(i, { judul: e.target.value })} maxLength={160} />
                <button className={btnSecondary} onClick={() => move(i, -1)} aria-label="Naik"><ArrowUp className="h-4 w-4" /></button>
                <button className={btnSecondary} onClick={() => move(i, 1)} aria-label="Turun"><ArrowDown className="h-4 w-4" /></button>
                <button className={btnDanger} onClick={() => setF({ ...f, konten: f.konten.filter((_, j) => j !== i) })} aria-label="Hapus"><Trash2 className="h-4 w-4" /></button>
              </div>
              <textarea className={inputCls} rows={3} placeholder="Isi (satu poin per baris untuk daftar)" value={s.isi} onChange={(e) => setSec(i, { isi: e.target.value })} maxLength={3000} />
              {slug === "tentang" && <ImageInput value={s.gambar ?? ""} onChange={(v) => setSec(i, { gambar: v })} />}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
