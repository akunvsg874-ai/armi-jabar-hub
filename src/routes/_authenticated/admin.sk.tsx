import { createFileRoute, redirect } from "@tanstack/react-router";
import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Pencil, Trash2, ExternalLink, Printer, Ban, RotateCcw, Wand2, X, Copy, FileText, Download } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { anggotaListQuery } from "@/lib/queries";
import { formatTanggal } from "@/lib/armi";
import { defaultSk, diktumLabel, diktumPertama, nextUrut, rowToSk, skVerifyUrl, suggestNomor, type SkData } from "@/lib/sk";
import { parseSkText, SK_TXT_CONTOH, type SkImport } from "@/lib/sk-import";
import { PageTitle, Table, td, Field, inputCls, btnPrimary, btnSecondary, btnDanger } from "@/components/portal/ui";
import { ImageInput } from "@/components/portal/ImageInput";
import { SkDocument, SkScaler, useSkQr } from "@/components/sk/SkDocument";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

async function fetchSkList() {
  const { data, error } = await supabase.from("surat_keputusan").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
const skListQuery = queryOptions({ queryKey: ["sk-list"], queryFn: fetchSkList });
type SkRow = Awaited<ReturnType<typeof fetchSkList>>[number];

export const Route = createFileRoute("/_authenticated/admin/sk")({
  beforeLoad: ({ context }) => { if (context.me.role !== "admin") throw redirect({ to: "/dashboard" }); },
  head: () => ({ meta: [{ title: "Generate SK — Portal ARMI Jabar" }, { name: "description", content: "Buat Surat Keputusan resmi dengan QR Code verifikasi." }] }),
  component: Page,
});

type Form = Omit<SkData, "kode"> & { anggota_id: string };

function ListEditor({ items, onChange, addLabel, lettered = true, offset = 0 }: { items: string[]; onChange: (v: string[]) => void; addLabel: string; lettered?: boolean; offset?: number }) {
  return (
    <div className="space-y-2">
      {items.map((t, i) => (
        <div key={i} className="flex gap-2">
          <span className="w-16 shrink-0 pt-2 text-xs font-bold text-muted-foreground">{lettered ? `${String.fromCharCode(97 + i)}.` : diktumLabel(i + offset)}</span>
          <textarea className={`${inputCls} min-h-[64px]`} value={t} maxLength={600} onChange={(e) => onChange(items.map((x, j) => (j === i ? e.target.value : x)))} />
          <button type="button" className={btnDanger} aria-label="Hapus poin" onClick={() => onChange(items.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></button>
        </div>
      ))}
      <button type="button" className={btnSecondary} onClick={() => onChange([...items, ""])}><Plus className="h-4 w-4" /> {addLabel}</button>
    </div>
  );
}

function Page() {
  const qc = useQueryClient();
  const { data: list = [] } = useQuery(skListQuery);
  const { data: anggota = [] } = useQuery(anggotaListQuery);
  const [form, setForm] = useState<Form | null>(null);
  const [editing, setEditing] = useState<SkRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<SkRow | null>(null);
  const [q, setQ] = useState("");
  const qr = useSkQr(editing?.kode);

  function openNew() {
    const d = defaultSk();
    setEditing(null);
    setForm({ ...d, nomor: suggestNomor(nextUrut(list.map((s) => s.nomor)), d.tanggal_ditetapkan), status: "aktif", anggota_id: "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const matchAnggota = (nama = "") => anggota.find((a) => a.nama_lengkap.trim().length > 3 && ` ${norm(nama)} `.includes(` ${norm(a.nama_lengkap)} `))?.id ?? "";

  async function importTxt(file: File) {
    const items = parseSkText(await file.text());
    if (!items.length) return void toast.error("Tidak ada SK yang terbaca. Pastikan tiap SK diawali “SURAT KEPUTUSAN KETUA ARMI”, lalu ada Nomor dan baris Pertama.");
    let urut = nextUrut(list.map((s) => s.nomor));
    const build = (it: SkImport): Form => {
      const d = defaultSk(it.jabatan, it.tingkat);
      const tanggal = it.tanggal_ditetapkan ?? d.tanggal_ditetapkan;
      return { ...d, ...it, nomor: it.nomor ?? suggestNomor(urut++, tanggal), tanggal_ditetapkan: tanggal, status: "aktif", anggota_id: matchAnggota(it.nama_penerima) };
    };
    if (items.length === 1) {
      setEditing(null); setForm(build(items[0]!));
      window.scrollTo({ top: 0, behavior: "smooth" });
      return void toast.success("SK dari notepad dimuat. Periksa pratinjau, lalu klik Generate SK & QR Code.");
    }
    const uid = (await supabase.auth.getUser()).data.user?.id ?? null;
    const existing = new Set(list.map((s) => s.nomor));
    const rows = items.map(build).filter((f) => !existing.has(f.nomor)).map(({ anggota_id, ...f }) => ({ ...f, anggota_id: anggota_id || null, ttd_url: null, created_by: uid }));
    const skipped = items.length - rows.length;
    if (!rows.length) return void toast.error(`Semua ${items.length} SK di file ini sudah ada (nomornya sama).`);
    const { error } = await supabase.from("surat_keputusan").insert(rows);
    if (error) return void toast.error(error.code === "23505" ? "Ada nomor SK yang dipakai dua kali di file" : "Gagal menyimpan SK dari file");
    toast.success(`${rows.length} SK berhasil dibuat dari notepad${skipped ? `, ${skipped} dilewati karena nomornya sudah ada` : ""}.`);
    refresh();
  }

  function downloadContoh() {
    const url = URL.createObjectURL(new Blob([SK_TXT_CONTOH], { type: "text/plain;charset=utf-8" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "contoh-sk.txt" });
    a.click(); URL.revokeObjectURL(url);
  }
  function openEdit(r: SkRow) {
    const s = rowToSk(r);
    setEditing(r);
    setForm({ ...s, anggota_id: r.anggota_id ?? "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => (f ? { ...f, [k]: v } : f));
  const refresh = () => qc.invalidateQueries({ queryKey: ["sk-list"] });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    const req: [string, string][] = [["Nomor SK", form.nomor], ["Nama penerima", form.nama_penerima], ["Jabatan", form.jabatan], ["Tingkat", form.tingkat],
      ["Tentang", form.tentang], ["Ditetapkan di", form.ditetapkan_di], ["Tanggal", form.tanggal_ditetapkan], ["Nama penandatangan", form.nama_penandatangan]];
    const empty = req.find(([, v]) => !v.trim());
    if (empty) return void toast.error(`${empty[0]} wajib diisi`);
    const clean = (a: string[]) => a.map((x) => x.trim()).filter(Boolean);
    const payload = {
      nomor: form.nomor.trim(), tentang: form.tentang.trim(), nama_penerima: form.nama_penerima.trim(), jabatan: form.jabatan.trim(), tingkat: form.tingkat.trim(),
      menimbang: clean(form.menimbang), mengingat: clean(form.mengingat), diktum_lain: clean(form.diktum_lain),
      ditetapkan_di: form.ditetapkan_di.trim(), tanggal_ditetapkan: form.tanggal_ditetapkan, jabatan_penandatangan: form.jabatan_penandatangan.trim(),
      nama_penandatangan: form.nama_penandatangan.trim(), ttd_url: form.ttd_url || null, status: form.status, anggota_id: form.anggota_id || null,
      updated_at: new Date().toISOString(),
    };
    setSaving(true);
    const res = editing
      ? await supabase.from("surat_keputusan").update(payload).eq("id", editing.id).select().single()
      : await supabase.from("surat_keputusan").insert({ ...payload, created_by: (await supabase.auth.getUser()).data.user?.id ?? null }).select().single();
    setSaving(false);
    if (res.error) return void toast.error(res.error.code === "23505" ? "Nomor SK sudah dipakai SK lain" : "Gagal menyimpan SK");
    toast.success(editing ? "SK diperbarui" : "SK berhasil dibuat, QR Code siap");
    setEditing(res.data);
    refresh();
  }

  async function toggleStatus(r: SkRow) {
    const status = r.status === "aktif" ? "dicabut" : "aktif";
    const { error } = await supabase.from("surat_keputusan").update({ status, updated_at: new Date().toISOString() }).eq("id", r.id);
    if (error) return void toast.error("Gagal mengubah status");
    toast.success(status === "dicabut" ? "SK dicabut — QR akan menampilkan status dicabut" : "SK diaktifkan kembali");
    refresh();
  }

  const shown = list.filter((s) => !q || [s.nomor, s.nama_penerima, s.jabatan].some((v) => v.toLowerCase().includes(q.toLowerCase())));

  return (
    <>
      <PageTitle title="Generate SK" desc="Buat Surat Keputusan resmi sesuai template DPD, lengkap dengan QR Code verifikasi keaslian."
        action={
          <div className="flex flex-wrap gap-2">
            <label className={`${btnSecondary} cursor-pointer`} title="Ketik SK di notepad seperti SK cetak; satu file boleh berisi banyak SK">
              <FileText className="h-4 w-4" /> Impor dari Notepad
              <input type="file" accept=".txt,text/plain" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) void importTxt(f); }} />
            </label>
            <button type="button" className={btnSecondary} onClick={downloadContoh}><Download className="h-4 w-4" /> Contoh file</button>
            {!form && <button className={btnPrimary} onClick={openNew}><Plus className="h-4 w-4" /> Buat SK Baru</button>}
          </div>
        } />

      {form && (
        <div className="mb-10 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <form onSubmit={save} className="space-y-4 rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold uppercase">{editing ? "Edit SK" : "SK Baru"}</h2>
              <button type="button" className={btnSecondary} onClick={() => { setForm(null); setEditing(null); }}><X className="h-4 w-4" /> Tutup</button>
            </div>

            <Field label="Anggota terkait (opsional)">
              <select className={inputCls} value={form.anggota_id} onChange={(e) => {
                const a = anggota.find((x) => x.id === e.target.value);
                setForm({ ...form, anggota_id: e.target.value, nama_penerima: a ? a.nama_lengkap.toUpperCase() : form.nama_penerima });
              }}>
                <option value="">— Bukan / belum terdaftar anggota —</option>
                {anggota.map((a) => <option key={a.id} value={a.id}>{a.nama_lengkap} · {a.nomor_anggota}</option>)}
              </select>
            </Field>
            <Field label="Nomor SK"><input className={`${inputCls} font-mono`} value={form.nomor} maxLength={80} onChange={(e) => set("nomor", e.target.value)} /></Field>
            <Field label="Nama penerima (lengkap dengan gelar)"><input className={inputCls} value={form.nama_penerima} maxLength={120} placeholder="IKHSAN NURDIEN, S.T" onChange={(e) => set("nama_penerima", e.target.value)} /></Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Jabatan"><input className={inputCls} value={form.jabatan} maxLength={120} onChange={(e) => set("jabatan", e.target.value)} /></Field>
              <Field label="Di tingkat"><input className={inputCls} value={form.tingkat} maxLength={120} onChange={(e) => set("tingkat", e.target.value)} /></Field>
            </div>
            <Field label="Tentang (satu baris per baris di SK)">
              <textarea className={`${inputCls} min-h-[64px] uppercase`} value={form.tentang} maxLength={300} onChange={(e) => set("tentang", e.target.value)} />
            </Field>
            <button type="button" className={btnSecondary} onClick={() => {
              const d = defaultSk(form.jabatan, form.tingkat);
              setForm({ ...form, tentang: d.tentang, menimbang: [d.menimbang[0] ?? "", ...form.menimbang.slice(1)] });
              toast.success("Tentang & Menimbang (a) disesuaikan dengan jabatan");
            }}><Wand2 className="h-4 w-4" /> Sesuaikan teks dengan jabatan</button>

            <Field label="Menimbang"><ListEditor items={form.menimbang} onChange={(v) => set("menimbang", v)} addLabel="Tambah poin Menimbang" /></Field>
            <Field label="Mengingat"><ListEditor items={form.mengingat} onChange={(v) => set("mengingat", v)} addLabel="Tambah poin Mengingat" /></Field>

            <div>
              <span className="mb-1 block text-sm font-semibold">Memutuskan — Menetapkan</span>
              <div className="mb-2 flex gap-2 rounded-lg border border-dashed border-border p-3 text-sm">
                <span className="w-16 shrink-0 text-xs font-bold text-muted-foreground">Pertama</span>
                <span className="text-muted-foreground">{diktumPertama(form.nama_penerima, form.jabatan, form.tingkat)} <i>(otomatis)</i></span>
              </div>
              <ListEditor items={form.diktum_lain} onChange={(v) => set("diktum_lain", v)} addLabel="Tambah diktum" lettered={false} offset={1} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Ditetapkan di"><input className={inputCls} value={form.ditetapkan_di} maxLength={120} onChange={(e) => set("ditetapkan_di", e.target.value)} /></Field>
              <Field label="Pada tanggal"><input type="date" className={inputCls} value={form.tanggal_ditetapkan} onChange={(e) => set("tanggal_ditetapkan", e.target.value)} /></Field>
              <Field label="Jabatan penandatangan"><input className={inputCls} value={form.jabatan_penandatangan} maxLength={120} onChange={(e) => set("jabatan_penandatangan", e.target.value)} /></Field>
              <Field label="Nama penandatangan"><input className={inputCls} value={form.nama_penandatangan} maxLength={120} onChange={(e) => set("nama_penandatangan", e.target.value)} /></Field>
            </div>
            <Field label="Foto tanda tangan / stempel (opsional, latar transparan)"><ImageInput value={form.ttd_url ?? ""} onChange={(v) => set("ttd_url", v || null)} /></Field>
            <Field label="Status">
              <select className={inputCls} value={form.status} onChange={(e) => set("status", e.target.value as Form["status"])}>
                <option value="aktif">Aktif (berlaku)</option><option value="dicabut">Dicabut</option>
              </select>
            </Field>
            <button disabled={saving} className={`${btnPrimary} w-full`}>{saving ? "Menyimpan…" : editing ? "Simpan Perubahan" : "Generate SK & QR Code"}</button>
          </form>

          <div className="space-y-3 xl:sticky xl:top-20 xl:self-start">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Pratinjau SK</span>
              {editing ? (
                <div className="flex flex-wrap gap-2">
                  <button type="button" className={btnSecondary} onClick={() => { navigator.clipboard.writeText(skVerifyUrl(editing.kode)); toast.success("Link verifikasi disalin"); }}><Copy className="h-4 w-4" /> Salin link</button>
                  <a className={btnSecondary} href={`/verifikasi-sk/${editing.kode}`} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" /> Halaman verifikasi</a>
                  <button type="button" className={btnPrimary} onClick={() => window.print()}><Printer className="h-4 w-4" /> Cetak / PDF</button>
                </div>
              ) : <span className="text-xs text-muted-foreground">QR Code muncul setelah SK disimpan</span>}
            </div>
            <SkScaler><SkDocument sk={form} qr={qr} /></SkScaler>
          </div>
        </div>
      )}

      <div className="mb-4"><input className={inputCls} placeholder="Cari nomor SK, nama, jabatan…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      <Table head={["Nomor SK", "Nama", "Jabatan", "Tanggal", "Status", "Aksi"]}>
        {shown.length === 0 && <tr><td className={`${td} text-muted-foreground`} colSpan={6}>Belum ada SK. Klik “Buat SK Baru”.</td></tr>}
        {shown.map((s) => (
          <tr key={s.id}>
            <td className={`${td} whitespace-nowrap font-mono text-xs`}>{s.nomor}</td>
            <td className={`${td} font-semibold`}>{s.nama_penerima}</td>
            <td className={td}>{s.jabatan}</td>
            <td className={`${td} whitespace-nowrap`}>{formatTanggal(s.tanggal_ditetapkan)}</td>
            <td className={td}>{s.status === "aktif"
              ? <span className="rounded-md bg-success/20 px-2 py-0.5 text-xs font-semibold text-success">Aktif</span>
              : <span className="rounded-md bg-destructive/20 px-2 py-0.5 text-xs font-semibold text-destructive">Dicabut</span>}</td>
            <td className={td}>
              <div className="flex gap-1">
                <a className={btnSecondary} href={`/verifikasi-sk/${s.kode}`} target="_blank" rel="noopener noreferrer" title="Lihat halaman verifikasi"><ExternalLink className="h-4 w-4" /></a>
                <button className={btnSecondary} onClick={() => openEdit(s)} title="Edit / Cetak"><Pencil className="h-4 w-4" /></button>
                <button className={btnSecondary} onClick={() => toggleStatus(s)} title={s.status === "aktif" ? "Cabut SK" : "Aktifkan kembali"}>{s.status === "aktif" ? <Ban className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}</button>
                <button className={btnDanger} onClick={() => setToDelete(s)} title="Hapus"><Trash2 className="h-4 w-4" /></button>
              </div>
            </td>
          </tr>
        ))}
      </Table>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader><AlertDialogTitle>Hapus SK ini?</AlertDialogTitle></AlertDialogHeader>
          <p className="text-sm text-muted-foreground">{toDelete?.nomor} — {toDelete?.nama_penerima}. QR Code pada SK yang sudah dicetak akan menampilkan “SK tidak terdaftar”. Gunakan “Cabut” bila hanya ingin menyatakan tidak berlaku.</p>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={async () => {
              const { error } = await supabase.from("surat_keputusan").delete().eq("id", toDelete!.id);
              if (error) return void toast.error("Gagal menghapus");
              if (editing?.id === toDelete!.id) { setForm(null); setEditing(null); }
              toast.success("SK dihapus"); refresh();
            }}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
