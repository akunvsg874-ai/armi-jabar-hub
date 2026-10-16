import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { WILAYAH_JABAR, formatTanggal } from "@/lib/armi";
import { PageTitle, Table, td, Modal, Field, inputCls, btnPrimary, btnSecondary, btnDanger } from "@/components/portal/ui";
import { EmptyState } from "@/components/site/shared";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { Database } from "@/integrations/supabase/types";

type Row = Database["public"]["Tables"]["blacklist"]["Row"];

export const Route = createFileRoute("/_authenticated/blacklist")({
  head: () => ({ meta: [{ title: "Blacklist Konsumen — Portal ARMI Jabar" }, { name: "description", content: "Data blacklist konsumen rental." }] }),
  component: Page,
});

function useDebounced(v: string) {
  const [d, setD] = useState(v);
  useEffect(() => { const t = setTimeout(() => setD(v), 300); return () => clearTimeout(t); }, [v]);
  return d;
}

function Page() {
  const { me } = Route.useRouteContext();
  return me.role === "admin" ? <AdminView nomor={me.nomor_anggota} /> : <SearchView />;
}

function SearchView() {
  const [q, setQ] = useState(""); const d = useDebounced(q);
  const { data = [], isLoading } = useQuery({
    queryKey: ["blacklist-search", d],
    queryFn: async () => (await supabase.rpc("cari_blacklist", { q: d })).data ?? [],
  });
  return (
    <>
      <PageTitle title="Blacklist Konsumen" desc="Cek konsumen bermasalah sebelum menyewakan unit." />
      <div className="relative mb-6 max-w-xl">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input className={`${inputCls} pl-9 py-3`} placeholder="Cari nama / NIK / wilayah" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {isLoading ? <p className="text-muted-foreground">Mencari…</p> : data.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {data.map((b) => (
            <div key={b.id} className="rounded-xl border border-destructive/40 bg-card p-4">
              <div className="flex justify-between gap-2"><span className="font-bold">{b.nama_konsumen}</span><span className="text-xs text-muted-foreground">{b.wilayah}</span></div>
              <p className="mt-1 text-sm text-muted-foreground">{b.keterangan}</p>
            </div>
          ))}
        </div>
      ) : <EmptyState text="Tidak ada data ditemukan" />}
    </>
  );
}

type Form = { nama_konsumen: string; nik: string; wilayah: string; no_hp_konsumen: string; keterangan: string };
const empty: Form = { nama_konsumen: "", nik: "", wilayah: "Kota Bandung", no_hp_konsumen: "", keterangan: "" };
const WILAYAH_OPTS = [...WILAYAH_JABAR, "Jakarta", "Banten", "Jawa Tengah", "Lainnya"];

function AdminView({ nomor }: { nomor: string }) {
  const qc = useQueryClient();
  const [q, setQ] = useState(""); const d = useDebounced(q);
  const [open, setOpen] = useState(false); const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<Form>(empty); const [toDelete, setToDelete] = useState<Row | null>(null);
  const { data = [] } = useQuery({
    queryKey: ["blacklist-admin", d],
    queryFn: async () => {
      let qb = supabase.from("blacklist").select("*").order("tanggal_input", { ascending: false });
      if (d) qb = qb.or(`nama_konsumen.ilike.%${d.replace(/[,()%]/g, "")}%,nik.ilike.%${d.replace(/[,()%]/g, "")}%,wilayah.ilike.%${d.replace(/[,()%]/g, "")}%`);
      return (await qb).data ?? [];
    },
  });
  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nama_konsumen.trim() || !form.keterangan.trim()) return void toast.error("Nama dan keterangan wajib diisi");
    const payload = { ...form, nik: form.nik || null, no_hp_konsumen: form.no_hp_konsumen || null };
    const { error } = editing ? await supabase.from("blacklist").update(payload).eq("id", editing.id) : await supabase.from("blacklist").insert({ ...payload, input_by: nomor });
    if (error) return void toast.error("Gagal menyimpan");
    toast.success("Tersimpan"); setOpen(false); qc.invalidateQueries({ queryKey: ["blacklist-admin"] });
  }

  return (
    <>
      <PageTitle title="Blacklist Konsumen" desc={`${data.length} data`} action={<button className={btnPrimary} onClick={() => { setEditing(null); setForm(empty); setOpen(true); }}><Plus className="h-4 w-4" /> Tambah</button>} />
      <input className={`${inputCls} mb-4 max-w-xl`} placeholder="Cari nama / NIK / wilayah" value={q} onChange={(e) => setQ(e.target.value)} />
      {data.length ? (
        <Table head={["Nama", "NIK", "Wilayah", "No HP", "Keterangan", "Tanggal", "Aksi"]}>
          {data.map((b) => (
            <tr key={b.id}>
              <td className={`${td} font-semibold`}>{b.nama_konsumen}</td>
              <td className={`${td} font-mono text-xs`}>{b.nik ?? "-"}</td>
              <td className={td}>{b.wilayah}</td>
              <td className={td}>{b.no_hp_konsumen ?? "-"}</td>
              <td className={td}>{b.keterangan}</td>
              <td className={`${td} whitespace-nowrap`}>{formatTanggal(b.tanggal_input)}</td>
              <td className={td}><div className="flex gap-1">
                <button className={btnSecondary} onClick={() => { setEditing(b); setForm({ nama_konsumen: b.nama_konsumen, nik: b.nik ?? "", wilayah: b.wilayah, no_hp_konsumen: b.no_hp_konsumen ?? "", keterangan: b.keterangan }); setOpen(true); }}><Pencil className="h-4 w-4" /></button>
                <button className={btnDanger} onClick={() => setToDelete(b)}><Trash2 className="h-4 w-4" /></button>
              </div></td>
            </tr>
          ))}
        </Table>
      ) : <EmptyState text="Tidak ada data ditemukan" />}
      <Modal open={open} onOpenChange={setOpen} title={editing ? "Edit Blacklist" : "Tambah Blacklist"}>
        <form onSubmit={submit} className="space-y-3">
          <Field label="Nama Konsumen"><input className={inputCls} value={form.nama_konsumen} onChange={set("nama_konsumen")} maxLength={100} /></Field>
          <Field label="NIK (opsional)"><input className={inputCls} value={form.nik} onChange={set("nik")} maxLength={16} /></Field>
          <Field label="Wilayah"><select className={inputCls} value={form.wilayah} onChange={set("wilayah")}>{WILAYAH_OPTS.map((w) => <option key={w}>{w}</option>)}</select></Field>
          <Field label="No HP (opsional)"><input className={inputCls} value={form.no_hp_konsumen} onChange={set("no_hp_konsumen")} maxLength={20} /></Field>
          <Field label="Keterangan"><textarea className={inputCls} rows={3} value={form.keterangan} onChange={set("keterangan")} maxLength={500} /></Field>
          <button className={`${btnPrimary} w-full`}>Simpan</button>
        </form>
      </Modal>
      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader><AlertDialogTitle>Yakin ingin menghapus data ini?</AlertDialogTitle></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={async () => {
              await supabase.from("blacklist").delete().eq("id", toDelete!.id); qc.invalidateQueries({ queryKey: ["blacklist-admin"] });
            }}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
