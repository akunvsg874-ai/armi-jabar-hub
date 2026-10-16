import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageTitle, Field, inputCls, btnPrimary, btnDanger } from "@/components/portal/ui";
import { ImageInput } from "@/components/portal/ImageInput";
import { EmptyState } from "@/components/site/shared";

export const Route = createFileRoute("/_authenticated/admin/galeri")({
  beforeLoad: ({ context }) => { if (context.me.role !== "admin") throw redirect({ to: "/dashboard" }); },
  head: () => ({ meta: [{ title: "Kelola Galeri — Portal ARMI Jabar" }, { name: "description", content: "Kelola foto galeri." }] }),
  component: Page,
});

function Page() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["galeri"], queryFn: async () => (await supabase.from("galeri").select("*").order("urutan").order("created_at", { ascending: false })).data ?? [] });
  const [judul, setJudul] = useState(""); const [gambar, setGambar] = useState("");
  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!gambar) return void toast.error("Pilih foto dulu");
    const { error } = await supabase.from("galeri").insert({ judul: judul.trim(), gambar, urutan: data.length });
    if (error) return void toast.error("Gagal menyimpan");
    setJudul(""); setGambar(""); toast.success("Foto ditambahkan"); qc.invalidateQueries({ queryKey: ["galeri"] });
  }
  return (
    <>
      <PageTitle title="Kelola Galeri" desc="Foto yang tampil di halaman Komunitas › Galeri" />
      <form onSubmit={add} className="mb-8 grid gap-3 rounded-lg border border-border bg-card p-5 md:grid-cols-[1fr_2fr_auto] md:items-end">
        <Field label="Keterangan"><input className={inputCls} value={judul} onChange={(e) => setJudul(e.target.value)} maxLength={120} /></Field>
        <Field label="Foto"><ImageInput value={gambar} onChange={setGambar} /></Field>
        <button className={btnPrimary}><Plus className="h-4 w-4" /> Tambah</button>
      </form>
      {data.length ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {data.map((g) => (
            <div key={g.id} className="overflow-hidden rounded-lg border border-border bg-card">
              <img src={g.gambar} alt={g.judul} className="aspect-square w-full object-cover" />
              <div className="flex items-center justify-between gap-2 p-3">
                <span className="truncate text-sm">{g.judul || "—"}</span>
                <button className={btnDanger} aria-label="Hapus" onClick={async () => { if (!confirm("Hapus foto ini?")) return; await supabase.from("galeri").delete().eq("id", g.id); qc.invalidateQueries({ queryKey: ["galeri"] }); }}><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      ) : <EmptyState text="Belum ada foto" />}
    </>
  );
}
