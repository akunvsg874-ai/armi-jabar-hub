import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { ImageInput } from "@/components/portal/ImageInput";
import { KegiatanDetail } from "@/components/site/KegiatanDetail";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { kegiatanQuery } from "@/lib/queries";
import { FOTO_KEGIATAN, JENIS_KEGIATAN, todayISO, type JenisKegiatan } from "@/lib/armi";
import { PageTitle, Modal, Field, inputCls, btnPrimary, btnSecondary, btnDanger } from "@/components/portal/ui";
import { KegiatanCard, EmptyState, type Kegiatan } from "@/components/site/shared";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_authenticated/kegiatan")({
  head: () => ({ meta: [{ title: "Kegiatan — Portal ARMI Jabar" }, { name: "description", content: "Kelola kegiatan DPD." }] }),
  component: Page,
});

type Form = { judul: string; jenis: JenisKegiatan; tanggal: string; waktu: string; lokasi: string; alamat: string; maps_url: string; penyelenggara: string; narahubung: string; deskripsi: string; foto: string; dokumentasi: string[] };
const empty = (): Form => ({ judul: "", jenis: "SOSIAL", tanggal: todayISO(), waktu: "", lokasi: "", alamat: "", maps_url: "", penyelenggara: "", narahubung: "", deskripsi: "", foto: FOTO_KEGIATAN, dokumentasi: [] });
const fromRow = (k: Kegiatan): Form => ({ judul: k.judul, jenis: k.jenis, tanggal: k.tanggal, waktu: k.waktu ?? "", lokasi: k.lokasi, alamat: k.alamat ?? "", maps_url: k.maps_url ?? "", penyelenggara: k.penyelenggara ?? "", narahubung: k.narahubung ?? "", deskripsi: k.deskripsi, foto: k.foto, dokumentasi: Array.isArray(k.dokumentasi) ? (k.dokumentasi as string[]) : [] });

function Page() {
  const { me } = Route.useRouteContext();
  const isAdmin = me.role === "admin";
  const qc = useQueryClient();
  const { data = [] } = useQuery(kegiatanQuery);
  const [open, setOpen] = useState(false); const [editing, setEditing] = useState<Kegiatan | null>(null);
  const [form, setForm] = useState<Form>(empty()); const [view, setView] = useState<Kegiatan | null>(null); const [toDelete, setToDelete] = useState<Kegiatan | null>(null);
  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.judul.trim() || !form.lokasi.trim() || !form.deskripsi.trim()) return void toast.error("Lengkapi semua data");
    const t = (v: string) => v.trim() || null;
    const payload = { judul: form.judul, jenis: form.jenis, tanggal: form.tanggal, lokasi: form.lokasi, deskripsi: form.deskripsi, foto: form.foto || FOTO_KEGIATAN,
      waktu: t(form.waktu), alamat: t(form.alamat), maps_url: t(form.maps_url), penyelenggara: t(form.penyelenggara), narahubung: t(form.narahubung), dokumentasi: form.dokumentasi.filter(Boolean) };
    const { error } = editing ? await supabase.from("kegiatan").update(payload).eq("id", editing.id) : await supabase.from("kegiatan").insert(payload);
    if (error) return void toast.error("Gagal menyimpan");
    toast.success("Kegiatan tersimpan"); setOpen(false); qc.invalidateQueries({ queryKey: ["kegiatan"] });
  }

  return (
    <>
      <PageTitle title={isAdmin ? "Kelola Kegiatan" : "Kegiatan"} desc="Agenda DPD ARMI Jawa Barat"
        action={isAdmin && <button className={btnPrimary} onClick={() => { setEditing(null); setForm(empty()); setOpen(true); }}><Plus className="h-4 w-4" /> Tambah Kegiatan</button>} />
      {data.length ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {data.map((k) => (
            <KegiatanCard key={k.id} k={k} onView={() => setView(k)} actions={isAdmin && (<>
              <button className={btnSecondary} onClick={() => { setEditing(k); setForm(fromRow(k)); setOpen(true); }}><Pencil className="h-4 w-4" /> Edit</button>
              <button className={btnDanger} onClick={() => setToDelete(k)}><Trash2 className="h-4 w-4" /> Hapus</button>
            </>)} />
          ))}
        </div>
      ) : <EmptyState text="Belum ada kegiatan" />}
      <Modal open={open} onOpenChange={setOpen} title={editing ? "Edit Kegiatan" : "Tambah Kegiatan"}>
        <form onSubmit={submit} className="space-y-3">
          <Field label="Judul"><input className={inputCls} value={form.judul} onChange={set("judul")} maxLength={150} /></Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Jenis"><select className={inputCls} value={form.jenis} onChange={set("jenis")}>{JENIS_KEGIATAN.map((j) => <option key={j}>{j}</option>)}</select></Field>
            <Field label="Tanggal"><input type="date" className={inputCls} value={form.tanggal} onChange={set("tanggal")} /></Field>
            <Field label="Waktu"><input className={inputCls} value={form.waktu} onChange={set("waktu")} placeholder="08.00 – 12.00 WIB" maxLength={60} /></Field>
          </div>
          <Field label="Lokasi / Tempat"><input className={inputCls} value={form.lokasi} onChange={set("lokasi")} maxLength={150} /></Field>
          <Field label="Alamat Lengkap"><input className={inputCls} value={form.alamat} onChange={set("alamat")} maxLength={300} /></Field>
          <Field label="Link Google Maps"><input className={inputCls} value={form.maps_url} onChange={set("maps_url")} placeholder="https://maps.app.goo.gl/…" maxLength={500} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Penyelenggara"><input className={inputCls} value={form.penyelenggara} onChange={set("penyelenggara")} placeholder="DPC Garut" maxLength={150} /></Field>
            <Field label="Narahubung"><input className={inputCls} value={form.narahubung} onChange={set("narahubung")} placeholder="Nama – 08xx" maxLength={150} /></Field>
          </div>
          <Field label="Deskripsi"><textarea className={inputCls} rows={5} value={form.deskripsi} onChange={set("deskripsi")} maxLength={5000} /></Field>
          <Field label="Foto Utama"><ImageInput value={form.foto} onChange={(v) => setForm({ ...form, foto: v })} /></Field>
          <Field label="Foto Dokumentasi (bisa lebih dari 1)">
            <div className="space-y-3">
              {form.dokumentasi.map((d, i) => (
                <div key={i} className="flex gap-2">
                  <div className="flex-1"><ImageInput value={d} onChange={(v) => setForm({ ...form, dokumentasi: form.dokumentasi.map((x, j) => (j === i ? v : x)) })} /></div>
                  <button type="button" className={btnSecondary} aria-label="Hapus foto" onClick={() => setForm({ ...form, dokumentasi: form.dokumentasi.filter((_, j) => j !== i) })}><X className="h-4 w-4" /></button>
                </div>
              ))}
              <button type="button" className={btnSecondary} onClick={() => setForm({ ...form, dokumentasi: [...form.dokumentasi, ""] })}><Plus className="h-4 w-4" /> Tambah Foto</button>
            </div>
          </Field>
          <button className={`${btnPrimary} w-full`}>Simpan</button>
        </form>
      </Modal>
      <KegiatanDetail k={view} onOpenChange={(o) => !o && setView(null)} />
      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader><AlertDialogTitle>Yakin ingin menghapus kegiatan ini?</AlertDialogTitle></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={async () => {
              await supabase.from("kegiatan").delete().eq("id", toDelete!.id); qc.invalidateQueries({ queryKey: ["kegiatan"] });
            }}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
