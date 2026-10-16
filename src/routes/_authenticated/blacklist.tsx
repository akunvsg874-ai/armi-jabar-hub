import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Search, Eye, Upload, X } from "lucide-react";
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

const arr = (v: unknown): string[] => (Array.isArray(v) ? (v as string[]) : []);

function Page() {
  const { me } = Route.useRouteContext();
  return me.role === "admin" ? <AdminView nomor={me.nomor_anggota} /> : <SearchView />;
}

/** Detail modal; loads via secure function so every active member can view a consumer's full record. */
function DetailModal({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ["blacklist-detail", id], enabled: !!id,
    queryFn: async () => (await supabase.rpc("detail_blacklist", { _id: id! })).data?.[0] ?? null,
  });
  const [urls, setUrls] = useState<string[]>([]);
  useEffect(() => {
    setUrls([]);
    const paths = arr(data?.bukti);
    if (!paths.length) return;
    supabase.storage.from("dokumen").createSignedUrls(paths, 600).then(({ data: s }) => setUrls((s ?? []).map((x) => x.signedUrl).filter(Boolean) as string[]));
  }, [data]);
  const kasus = arr(data?.riwayat_kasus);
  return (
    <Modal open={!!id} onOpenChange={(o) => !o && onClose()} title="Detail Blacklist Konsumen">
      {isLoading || !data ? <p className="text-muted-foreground">{isLoading ? "Memuat…" : "Data tidak ditemukan"}</p> : (
        <div className="max-h-[75vh] space-y-3 overflow-y-auto pr-1 text-sm">
          {[["Nama", data.nama_konsumen], ["NIK", data.nik], ["Wilayah", data.wilayah], ["No. HP", data.no_hp_konsumen], ["Keterangan", data.keterangan],
            ["Tanggal Kejadian Terakhir", data.tanggal_kejadian ? formatTanggal(data.tanggal_kejadian) : null], ["Tanggal Input", formatTanggal(data.tanggal_input)]].map(([k, v]) => (
            <div key={k as string}><div className="text-xs uppercase text-muted-foreground">{k}</div><div className="font-medium">{v || "-"}</div></div>
          ))}
          <div><div className="text-xs uppercase text-muted-foreground">History Kasus</div>
            {kasus.length ? <ol className="ml-5 list-decimal space-y-1">{kasus.map((k, i) => <li key={i}>{k}</li>)}</ol> : <div>-</div>}
          </div>
          <div><div className="mb-1 text-xs uppercase text-muted-foreground">Bukti</div>
            {urls.length ? <div className="grid grid-cols-2 gap-2">{urls.map((u) => (
              <a key={u} href={u} target="_blank" rel="noopener noreferrer"><img src={u} alt="Bukti" className="h-32 w-full rounded-md object-cover" /></a>
            ))}</div> : <div>{arr(data.bukti).length ? "Memuat…" : "-"}</div>}
          </div>
        </div>
      )}
    </Modal>
  );
}

function SearchView() {
  const [q, setQ] = useState(""); const d = useDebounced(q);
  const [detail, setDetail] = useState<string | null>(null);
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
            <div key={b.id} className="rounded-lg border border-destructive/40 bg-card p-4">
              <div className="flex justify-between gap-2"><span className="font-bold">{b.nama_konsumen}</span><span className="text-xs text-muted-foreground">{b.wilayah}</span></div>
              <p className="mt-1 text-sm text-muted-foreground">{b.keterangan}</p>
              <button className={`${btnSecondary} mt-3`} onClick={() => setDetail(b.id)}><Eye className="h-4 w-4" /> Lihat Detail</button>
            </div>
          ))}
        </div>
      ) : <EmptyState text="Tidak ada data ditemukan" />}
      <DetailModal id={detail} onClose={() => setDetail(null)} />
    </>
  );
}

type Form = { nama_konsumen: string; nik: string; wilayah: string; no_hp_konsumen: string; keterangan: string; riwayat_kasus: string[]; tanggal_kejadian: string; bukti: string[] };
const empty: Form = { nama_konsumen: "", nik: "", wilayah: "Kota Bandung", no_hp_konsumen: "", keterangan: "", riwayat_kasus: [""], tanggal_kejadian: "", bukti: [] };
const WILAYAH_OPTS = [...WILAYAH_JABAR, "Jakarta", "Banten", "Jawa Tengah", "Lainnya"];

function AdminView({ nomor }: { nomor: string }) {
  const qc = useQueryClient();
  const [q, setQ] = useState(""); const d = useDebounced(q);
  const [open, setOpen] = useState(false); const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<Form>(empty); const [toDelete, setToDelete] = useState<Row | null>(null);
  const [detail, setDetail] = useState<string | null>(null); const [busy, setBusy] = useState(false);
  const { data = [] } = useQuery({
    queryKey: ["blacklist-admin", d],
    queryFn: async () => {
      let qb = supabase.from("blacklist").select("*").order("tanggal_input", { ascending: false });
      const s = d.replace(/[,()%]/g, "");
      if (s) qb = qb.or(`nama_konsumen.ilike.%${s}%,nik.ilike.%${s}%,wilayah.ilike.%${s}%`);
      return (await qb).data ?? [];
    },
  });
  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm({ ...form, [k]: e.target.value });
  const setKasus = (i: number, v: string) => setForm({ ...form, riwayat_kasus: form.riwayat_kasus.map((k, j) => (j === i ? v : k)) });

  async function upload(files: FileList) {
    setBusy(true); const added: string[] = [];
    for (const f of Array.from(files)) {
      if (!f.type.startsWith("image/")) { toast.error(`${f.name}: harus foto`); continue; }
      if (f.size > 5 * 1024 * 1024) { toast.error(`${f.name}: maksimal 5 MB`); continue; }
      const path = `bukti/${Date.now()}-${f.name.replace(/[^a-zA-Z0-9.]+/g, "-")}`;
      const { error } = await supabase.storage.from("dokumen").upload(path, f, { contentType: f.type });
      if (error) toast.error(`Gagal mengunggah ${f.name}`); else added.push(path);
    }
    setBusy(false);
    if (added.length) { setForm((p) => ({ ...p, bukti: [...p.bukti, ...added] })); toast.success(`${added.length} bukti diunggah`); }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nama_konsumen.trim() || !form.keterangan.trim()) return void toast.error("Nama dan keterangan wajib diisi");
    const payload = { ...form, nik: form.nik || null, no_hp_konsumen: form.no_hp_konsumen || null, tanggal_kejadian: form.tanggal_kejadian || null,
      riwayat_kasus: form.riwayat_kasus.map((k) => k.trim()).filter(Boolean) };
    const { error } = editing ? await supabase.from("blacklist").update(payload).eq("id", editing.id) : await supabase.from("blacklist").insert({ ...payload, input_by: nomor });
    if (error) return void toast.error("Gagal menyimpan");
    toast.success("Tersimpan"); setOpen(false); qc.invalidateQueries({ queryKey: ["blacklist-admin"] }); qc.invalidateQueries({ queryKey: ["blacklist-detail"] });
  }

  function openEdit(b: Row) {
    const k = arr(b.riwayat_kasus);
    setEditing(b); setForm({ nama_konsumen: b.nama_konsumen, nik: b.nik ?? "", wilayah: b.wilayah, no_hp_konsumen: b.no_hp_konsumen ?? "", keterangan: b.keterangan,
      riwayat_kasus: k.length ? k : [""], tanggal_kejadian: b.tanggal_kejadian ?? "", bukti: arr(b.bukti) }); setOpen(true);
  }

  return (
    <>
      <PageTitle title="Blacklist Konsumen" desc={`${data.length} data`} action={<button className={btnPrimary} onClick={() => { setEditing(null); setForm(empty); setOpen(true); }}><Plus className="h-4 w-4" /> Tambah</button>} />
      <input className={`${inputCls} mb-4 max-w-xl`} placeholder="Cari nama / NIK / wilayah" value={q} onChange={(e) => setQ(e.target.value)} />
      {data.length ? (
        <Table head={["Nama", "NIK", "Wilayah", "No HP", "Keterangan", "Kejadian Terakhir", "Bukti", "Aksi"]}>
          {data.map((b) => (
            <tr key={b.id}>
              <td className={`${td} font-semibold`}>{b.nama_konsumen}</td>
              <td className={`${td} font-mono text-xs`}>{b.nik ?? "-"}</td>
              <td className={td}>{b.wilayah}</td>
              <td className={td}>{b.no_hp_konsumen ?? "-"}</td>
              <td className={td}>{b.keterangan}</td>
              <td className={`${td} whitespace-nowrap`}>{b.tanggal_kejadian ? formatTanggal(b.tanggal_kejadian) : "-"}</td>
              <td className={td}>{arr(b.bukti).length}</td>
              <td className={td}><div className="flex gap-1">
                <button className={btnSecondary} title="Lihat Detail" onClick={() => setDetail(b.id)}><Eye className="h-4 w-4" /></button>
                <button className={btnSecondary} title="Edit" onClick={() => openEdit(b)}><Pencil className="h-4 w-4" /></button>
                <button className={btnDanger} title="Hapus" onClick={() => setToDelete(b)}><Trash2 className="h-4 w-4" /></button>
              </div></td>
            </tr>
          ))}
        </Table>
      ) : <EmptyState text="Tidak ada data ditemukan" />}
      <Modal open={open} onOpenChange={setOpen} title={editing ? "Edit Blacklist" : "Tambah Blacklist"}>
        <form onSubmit={submit} className="max-h-[75vh] space-y-3 overflow-y-auto pr-1">
          <Field label="Nama"><input className={inputCls} value={form.nama_konsumen} onChange={set("nama_konsumen")} maxLength={100} /></Field>
          <Field label="NIK"><input className={inputCls} value={form.nik} onChange={set("nik")} maxLength={16} /></Field>
          <Field label="Wilayah"><select className={inputCls} value={form.wilayah} onChange={set("wilayah")}>{WILAYAH_OPTS.map((w) => <option key={w}>{w}</option>)}</select></Field>
          <Field label="No. HP"><input className={inputCls} value={form.no_hp_konsumen} onChange={set("no_hp_konsumen")} maxLength={20} /></Field>
          <Field label="Keterangan"><textarea className={inputCls} rows={3} value={form.keterangan} onChange={set("keterangan")} maxLength={500} /></Field>
          <Field label="History Kasus">
            <div className="space-y-2">
              {form.riwayat_kasus.map((k, i) => (
                <div key={i} className="flex gap-2">
                  <textarea className={inputCls} rows={2} value={k} onChange={(e) => setKasus(i, e.target.value)} maxLength={500} placeholder={`Kasus ${i + 1}`} />
                  <button type="button" className={btnDanger} aria-label="Hapus kasus" onClick={() => setForm({ ...form, riwayat_kasus: form.riwayat_kasus.length > 1 ? form.riwayat_kasus.filter((_, j) => j !== i) : [""] })}><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
              <button type="button" className={btnSecondary} onClick={() => setForm({ ...form, riwayat_kasus: [...form.riwayat_kasus, ""] })}><Plus className="h-4 w-4" /> Tambah Kasus</button>
            </div>
          </Field>
          <Field label="Tanggal Kejadian Terakhir"><input type="date" className={inputCls} value={form.tanggal_kejadian} onChange={set("tanggal_kejadian")} /></Field>
          <Field label="Upload Bukti">
            <div className="space-y-2">
              <label className={`${btnSecondary} cursor-pointer`}>
                <Upload className="h-4 w-4" />{busy ? "Mengunggah…" : "Tambah Bukti"}
                <input type="file" accept="image/*" multiple hidden onChange={(e) => { if (e.target.files?.length) upload(e.target.files); e.target.value = ""; }} />
              </label>
              {form.bukti.length ? <ul className="space-y-1 text-xs">{form.bukti.map((p, i) => (
                <li key={p} className="flex items-center justify-between gap-2 rounded border border-border px-2 py-1">
                  <span className="truncate">Bukti {i + 1}</span>
                  <button type="button" aria-label="Hapus bukti" onClick={() => setForm({ ...form, bukti: form.bukti.filter((x) => x !== p) })}><X className="h-4 w-4" /></button>
                </li>
              ))}</ul> : <span className="text-xs text-muted-foreground">Belum ada bukti</span>}
            </div>
          </Field>
          <button disabled={busy} className={`${btnPrimary} w-full`}>Simpan</button>
        </form>
      </Modal>
      <DetailModal id={detail} onClose={() => setDetail(null)} />
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
