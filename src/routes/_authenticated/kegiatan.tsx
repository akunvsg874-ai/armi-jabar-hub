import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
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

type Form = { judul: string; jenis: JenisKegiatan; tanggal: string; lokasi: string; deskripsi: string; foto: string };
const empty = (): Form => ({ judul: "", jenis: "SOSIAL", tanggal: todayISO(), lokasi: "", deskripsi: "", foto: FOTO_KEGIATAN });

function Page() {
  const { me } = Route.useRouteContext();
  const isAdmin = me.role === "admin";
  const qc = useQueryClient();
  const { data = [] } = useQuery(kegiatanQuery);
  const [open, setOpen] = useState(false); const [editing, setEditing] = useState<Kegiatan | null>(null);
  const [form, setForm] = useState<Form>(empty()); const [toDelete, setToDelete] = useState<Kegiatan | null>(null);
  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.judul.trim() || !form.lokasi.trim() || !form.deskripsi.trim()) return void toast.error("Lengkapi semua data");
    const payload = { ...form, foto: form.foto || FOTO_KEGIATAN };
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
            <KegiatanCard key={k.id} k={k} actions={isAdmin && (<>
              <button className={btnSecondary} onClick={() => { setEditing(k); setForm({ judul: k.judul, jenis: k.jenis, tanggal: k.tanggal, lokasi: k.lokasi, deskripsi: k.deskripsi, foto: k.foto }); setOpen(true); }}><Pencil className="h-4 w-4" /> Edit</button>
              <button className={btnDanger} onClick={() => setToDelete(k)}><Trash2 className="h-4 w-4" /> Hapus</button>
            </>)} />
          ))}
        </div>
      ) : <EmptyState text="Belum ada kegiatan" />}
      <Modal open={open} onOpenChange={setOpen} title={editing ? "Edit Kegiatan" : "Tambah Kegiatan"}>
        <form onSubmit={submit} className="space-y-3">
          <Field label="Judul"><input className={inputCls} value={form.judul} onChange={set("judul")} maxLength={150} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Jenis"><select className={inputCls} value={form.jenis} onChange={set("jenis")}>{JENIS_KEGIATAN.map((j) => <option key={j}>{j}</option>)}</select></Field>
            <Field label="Tanggal"><input type="date" className={inputCls} value={form.tanggal} onChange={set("tanggal")} /></Field>
          </div>
          <Field label="Lokasi"><input className={inputCls} value={form.lokasi} onChange={set("lokasi")} maxLength={150} /></Field>
          <Field label="Deskripsi"><textarea className={inputCls} rows={4} value={form.deskripsi} onChange={set("deskripsi")} maxLength={2000} /></Field>
          <Field label="URL Foto"><input className={inputCls} value={form.foto} onChange={set("foto")} /></Field>
          <button className={`${btnPrimary} w-full`}>Simpan</button>
        </form>
      </Modal>
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
