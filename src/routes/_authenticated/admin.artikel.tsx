import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/cms";
import { formatTanggal, todayISO } from "@/lib/armi";
import { PageTitle, Modal, Field, inputCls, btnPrimary, btnSecondary, btnDanger } from "@/components/portal/ui";
import { ImageInput } from "@/components/portal/ImageInput";
import { EmptyState } from "@/components/site/shared";
import type { Database } from "@/integrations/supabase/types";

type Artikel = Database["public"]["Tables"]["artikel"]["Row"];

export const Route = createFileRoute("/_authenticated/admin/artikel")({
  beforeLoad: ({ context }) => { if (context.me.role !== "admin") throw redirect({ to: "/dashboard" }); },
  head: () => ({ meta: [{ title: "Kelola Artikel — Portal ARMI Jabar" }, { name: "description", content: "Tulis dan terbitkan artikel." }] }),
  component: Page,
});

const empty = () => ({ judul: "", slug: "", ringkasan: "", isi: "", gambar: "", seo_title: "", seo_description: "", terbit: true, tanggal: todayISO() });
type Form = ReturnType<typeof empty>;

function Page() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["admin-artikel"], queryFn: async () => (await supabase.from("artikel").select("*").order("tanggal", { ascending: false })).data ?? [] });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Artikel | null>(null);
  const [f, setF] = useState<Form>(empty());
  const t = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  const refresh = () => { qc.invalidateQueries({ queryKey: ["admin-artikel"] }); qc.invalidateQueries({ queryKey: ["artikel-publik"] }); };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!f.judul.trim() || !f.isi.trim()) return void toast.error("Judul dan isi wajib diisi");
    const payload = { ...f, slug: slugify(f.slug || f.judul), gambar: f.gambar || null, seo_title: f.seo_title || null, seo_description: f.seo_description || null };
    const { error } = editing ? await supabase.from("artikel").update(payload).eq("id", editing.id) : await supabase.from("artikel").insert(payload);
    if (error) return void toast.error(error.code === "23505" ? "Alamat (slug) sudah dipakai" : "Gagal menyimpan");
    toast.success("Artikel tersimpan"); setOpen(false); refresh();
  }

  return (
    <>
      <PageTitle title="Kelola Artikel" desc="Berita dan tulisan untuk halaman Artikel"
        action={<button className={btnPrimary} onClick={() => { setEditing(null); setF(empty()); setOpen(true); }}><Plus className="h-4 w-4" /> Tulis Artikel</button>} />
      {data.length ? (
        <div className="space-y-3">
          {data.map((a) => (
            <div key={a.id} className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card p-4">
              {a.gambar && <img src={a.gambar} alt="" className="h-16 w-24 rounded object-cover" />}
              <div className="min-w-0 flex-1">
                <div className="font-bold">{a.judul}</div>
                <div className="text-xs text-muted-foreground">{formatTanggal(a.tanggal)} · /artikel/{a.slug} · {a.terbit ? <span className="text-success">Terbit</span> : "Draf"}</div>
              </div>
              <button className={btnSecondary} onClick={() => { setEditing(a); setF({ judul: a.judul, slug: a.slug, ringkasan: a.ringkasan, isi: a.isi, gambar: a.gambar ?? "", seo_title: a.seo_title ?? "", seo_description: a.seo_description ?? "", terbit: a.terbit, tanggal: a.tanggal }); setOpen(true); }}><Pencil className="h-4 w-4" /> Edit</button>
              <button className={btnDanger} onClick={async () => { if (!confirm("Hapus artikel ini?")) return; await supabase.from("artikel").delete().eq("id", a.id); refresh(); }}><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      ) : <EmptyState text="Belum ada artikel" />}
      <Modal open={open} onOpenChange={setOpen} title={editing ? "Edit Artikel" : "Tulis Artikel"}>
        <form onSubmit={submit} className="max-h-[75vh] space-y-3 overflow-y-auto pr-1">
          <Field label="Judul"><input className={inputCls} value={f.judul} onChange={t("judul")} maxLength={160} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Alamat (slug)"><input className={inputCls} value={f.slug} onChange={t("slug")} placeholder={slugify(f.judul)} /></Field>
            <Field label="Tanggal"><input type="date" className={inputCls} value={f.tanggal} onChange={t("tanggal")} /></Field>
          </div>
          <Field label="Ringkasan"><textarea className={inputCls} rows={2} value={f.ringkasan} onChange={t("ringkasan")} maxLength={300} /></Field>
          <Field label="Isi artikel"><textarea className={inputCls} rows={8} value={f.isi} onChange={t("isi")} maxLength={20000} /></Field>
          <Field label="Foto utama"><ImageInput value={f.gambar} onChange={(v) => setF({ ...f, gambar: v })} /></Field>
          <Field label="Judul SEO (opsional)"><input className={inputCls} value={f.seo_title} onChange={t("seo_title")} maxLength={90} /></Field>
          <Field label="Deskripsi SEO (opsional)"><textarea className={inputCls} rows={2} value={f.seo_description} onChange={t("seo_description")} maxLength={200} /></Field>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.terbit} onChange={(e) => setF({ ...f, terbit: e.target.checked })} /> Terbitkan</label>
          <button className={`${btnPrimary} w-full`}>Simpan</button>
        </form>
      </Modal>
    </>
  );
}
