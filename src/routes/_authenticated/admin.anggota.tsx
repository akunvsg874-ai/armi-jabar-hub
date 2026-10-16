import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, KeyRound, Copy, Upload, Eye, X } from "lucide-react";
import { toast } from "sonner";
import { anggotaListQuery } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { WILAYAH_JABAR } from "@/lib/armi";
import { createAnggota, updateAnggota, deleteAnggota, resetPassword } from "@/lib/anggota.functions";
import { PageTitle, Table, td, Modal, Field, inputCls, btnPrimary, btnSecondary, btnDanger } from "@/components/portal/ui";
import { StatusBadge } from "@/components/site/shared";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { Me } from "@/lib/session";

export const Route = createFileRoute("/_authenticated/admin/anggota")({
  beforeLoad: ({ context }) => { if (context.me.role !== "admin") throw redirect({ to: "/dashboard" }); },
  head: () => ({ meta: [{ title: "Kelola Anggota — Portal ARMI Jabar" }, { name: "description", content: "Kelola data anggota." }] }),
  component: Page,
});

type Form = {
  nama_lengkap: string; no_anggota: string; wilayah: string; nama_usaha: string; maps_url: string; nib: string;
  ktp_path: string | null; garasi_path: string | null; unit: string[];
  status: "aktif" | "non_aktif"; role: "admin" | "bendahara" | "anggota";
};
const empty: Form = { nama_lengkap: "", no_anggota: "", wilayah: "Kota Bandung", nama_usaha: "", maps_url: "", nib: "", ktp_path: null, garasi_path: null, unit: [""], status: "aktif", role: "anggota" };

/** Uploads a private document (KTP / garage photo); only admins can view it via short-lived links. */
function DocUpload({ label, value, onChange, prefix }: { label: string; value: string | null; onChange: (p: string | null) => void; prefix: string }) {
  const [busy, setBusy] = useState(false);
  async function pick(f: File) {
    if (!f.type.startsWith("image/")) return void toast.error("File harus berupa foto");
    if (f.size > 5 * 1024 * 1024) return void toast.error("Maksimal 5 MB");
    setBusy(true);
    const path = `${prefix}/${Date.now()}-${f.name.replace(/[^a-zA-Z0-9.]+/g, "-")}`;
    const { error } = await supabase.storage.from("dokumen").upload(path, f, { contentType: f.type });
    setBusy(false);
    if (error) return void toast.error("Gagal mengunggah");
    onChange(path); toast.success("Foto diunggah");
  }
  async function view() {
    const { data } = await supabase.storage.from("dokumen").createSignedUrl(value!, 120);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank", "noopener");
  }
  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className={`${btnSecondary} cursor-pointer`}>
        <Upload className="h-4 w-4" />{busy ? "Mengunggah…" : label}
        <input type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) pick(f); e.target.value = ""; }} />
      </label>
      {value ? (<>
        <span className="text-xs text-success">Terunggah</span>
        <button type="button" className={btnSecondary} onClick={view}><Eye className="h-4 w-4" /> Lihat</button>
        <button type="button" className={btnSecondary} onClick={() => onChange(null)} aria-label="Hapus foto"><X className="h-4 w-4" /></button>
      </>) : <span className="text-xs text-muted-foreground">Belum ada foto</span>}
    </div>
  );
}

function Page() {
  const qc = useQueryClient();
  const { data = [] } = useQuery(anggotaListQuery);
  const [q, setQ] = useState(""); const [fw, setFw] = useState(""); const [fs, setFs] = useState("");
  const [editing, setEditing] = useState<Me | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(empty);
  const [preview, setPreview] = useState("");
  const [cred, setCred] = useState<{ nomor_anggota: string; password: string } | null>(null);
  const [toDelete, setToDelete] = useState<Me | null>(null);
  const [viewing, setViewing] = useState<Me | null>(null);
  const [saving, setSaving] = useState(false);
  const create = useServerFn(createAnggota), update = useServerFn(updateAnggota), del = useServerFn(deleteAnggota), reset = useServerFn(resetPassword);

  const list = useMemo(() => data.filter((a) => {
    const s = q.toLowerCase();
    return (!s || [a.nama_lengkap, a.nama_usaha, a.nomor_anggota, a.no_hp].some((v) => v.toLowerCase().includes(s)))
      && (!fw || a.wilayah === fw) && (!fs || a.status === fs);
  }), [data, q, fw, fs]);

  async function openAdd() {
    setEditing(null); setForm(empty); setOpen(true);
    const { data } = await supabase.rpc("peek_nomor_anggota"); setPreview(data ?? "");
  }
  function openEdit(a: Me) {
    setEditing(a); setPreview(a.nomor_anggota);
    const r = a as Me & { no_anggota: string | null; maps_url: string | null; nib: string | null; ktp_path: string | null; garasi_path: string | null; unit: unknown };
    const unit = Array.isArray(r.unit) ? (r.unit as string[]) : [];
    setForm({ nama_lengkap: a.nama_lengkap, no_anggota: r.no_anggota ?? "", wilayah: a.wilayah, nama_usaha: a.nama_usaha, maps_url: r.maps_url ?? "", nib: r.nib ?? "",
      ktp_path: r.ktp_path, garasi_path: r.garasi_path, unit: unit.length ? unit : [""], status: a.status, role: a.role });
    setOpen(true);
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nama_lengkap.trim() || !form.nama_usaha.trim()) return void toast.error("Nama lengkap dan nama garasi wajib diisi");
    if (form.maps_url && !/^https?:\/\//.test(form.maps_url.trim())) return void toast.error("Link Google Maps harus diawali https://");
    const payload = { ...form, no_anggota: form.no_anggota.trim() || null, maps_url: form.maps_url.trim() || null, nib: form.nib.trim() || null,
      unit: form.unit.map((u) => u.trim()).filter(Boolean), no_hp: editing?.no_hp ?? "" };
    setSaving(true);
    try {
      if (editing) { await update({ data: { ...payload, id: editing.id } as never }); toast.success("Anggota diperbarui"); }
      else { const r = await create({ data: payload as never }); setCred(r); }
      setOpen(false); qc.invalidateQueries({ queryKey: ["anggota-list"] });
    } catch (err) { toast.error((err as Error).message); } finally { setSaving(false); }
  }

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value });
  const setUnit = (i: number, v: string) => setForm({ ...form, unit: form.unit.map((u, j) => (j === i ? v : u)) });

  return (
    <>
      <PageTitle title="Kelola Anggota" desc={`${data.length} anggota terdaftar`} action={<button className={btnPrimary} onClick={openAdd}><Plus className="h-4 w-4" /> Tambah Anggota</button>} />
      <div className="mb-4 grid gap-2 md:grid-cols-[2fr_1fr_1fr]">
        <input className={inputCls} placeholder="Cari nama, usaha, nomor, HP…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className={inputCls} value={fw} onChange={(e) => setFw(e.target.value)}><option value="">Semua wilayah</option>{WILAYAH_JABAR.map((w) => <option key={w}>{w}</option>)}</select>
        <select className={inputCls} value={fs} onChange={(e) => setFs(e.target.value)}><option value="">Semua status</option><option value="aktif">Aktif</option><option value="non_aktif">Non-aktif</option></select>
      </div>
      <Table head={["Nomor Login", "No. Anggota", "Nama", "Garasi", "DPC", "Unit", "Status", "Role", "Aksi"]}>
        {list.map((a) => (
          <tr key={a.id}>
            <td className={`${td} whitespace-nowrap font-mono text-xs`}>{a.nomor_anggota}</td>
            <td className={`${td} whitespace-nowrap font-mono text-xs`}>{(a as { no_anggota?: string | null }).no_anggota ?? "—"}</td>
            <td className={`${td} font-semibold`}>{a.nama_lengkap}</td>
            <td className={td}>{a.nama_usaha}</td>
            <td className={td}>{a.wilayah}</td>
            <td className={td}>{Array.isArray((a as { unit?: unknown }).unit) ? ((a as { unit: unknown[] }).unit.length) : 0}</td>
            <td className={td}><StatusBadge status={a.status} /></td>
            <td className={`${td} uppercase text-xs font-bold`}>{a.role}</td>
            <td className={td}>
              <div className="flex gap-1">
                <button className={btnSecondary} onClick={() => setViewing(a)} title="Lihat Data"><Eye className="h-4 w-4" /></button>
                <button className={btnSecondary} onClick={() => openEdit(a)} title="Edit"><Pencil className="h-4 w-4" /></button>
                <button className={btnSecondary} title="Reset Password" onClick={async () => {
                  try { setCred(await reset({ data: { id: a.id } })); qc.invalidateQueries({ queryKey: ["anggota-list"] }); } catch (e) { toast.error((e as Error).message); }
                }}><KeyRound className="h-4 w-4" /></button>
                <button className={btnDanger} onClick={() => setToDelete(a)} title="Hapus"><Trash2 className="h-4 w-4" /></button>
              </div>
            </td>
          </tr>
        ))}
      </Table>

      <Modal open={open} onOpenChange={setOpen} title={editing ? "Edit Anggota" : "Tambah Anggota"}>
        <form onSubmit={submit} className="max-h-[75vh] space-y-3 overflow-y-auto pr-1">
          <Field label="Nomor Login Anggota (otomatis)"><input className={`${inputCls} opacity-70`} value={preview} readOnly /></Field>
          <Field label="Nama Lengkap"><input className={inputCls} value={form.nama_lengkap} onChange={set("nama_lengkap")} maxLength={100} placeholder="Iyus Abdurrahman" /></Field>
          <Field label="No. Anggota"><input className={inputCls} value={form.no_anggota} onChange={set("no_anggota")} maxLength={40} placeholder="05.2024.06.06.0122" /></Field>
          <Field label="KTP / SIM"><DocUpload label="Upload KTP" value={form.ktp_path} onChange={(p) => setForm({ ...form, ktp_path: p })} prefix="ktp" /></Field>
          <Field label="Nama Garasi"><input className={inputCls} value={form.nama_usaha} onChange={set("nama_usaha")} maxLength={100} placeholder="Yuz Rentcar" /></Field>
          <Field label="Foto Garasi Rental"><DocUpload label="Upload Garasi Rental" value={form.garasi_path} onChange={(p) => setForm({ ...form, garasi_path: p })} prefix="garasi" /></Field>
          <Field label="DPC"><select className={inputCls} value={form.wilayah} onChange={set("wilayah")}>{WILAYAH_JABAR.map((w) => <option key={w}>{w}</option>)}</select></Field>
          <Field label="Koordinat / Link Google Maps Garasi"><input className={inputCls} value={form.maps_url} onChange={set("maps_url")} maxLength={500} placeholder="https://maps.app.goo.gl/…" /></Field>
          <Field label="NIB (jika ada)"><input className={inputCls} value={form.nib} onChange={set("nib")} maxLength={40} /></Field>
          <Field label="Data Unit">
            <div className="space-y-2">
              {form.unit.map((u, i) => (
                <div key={i} className="flex gap-2">
                  <input className={inputCls} value={u} onChange={(e) => setUnit(i, e.target.value)} maxLength={120} placeholder="New Avanza MT (Hitam) Z 1062 EN" />
                  <button type="button" className={btnDanger} aria-label="Hapus unit" onClick={() => setForm({ ...form, unit: form.unit.length > 1 ? form.unit.filter((_, j) => j !== i) : [""] })}><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
              <button type="button" className={btnSecondary} onClick={() => setForm({ ...form, unit: [...form.unit, ""] })}><Plus className="h-4 w-4" /> Tambah Unit</button>
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Status"><select className={inputCls} value={form.status} onChange={set("status")}><option value="aktif">Aktif</option><option value="non_aktif">Non-aktif</option></select></Field>
            <Field label="Role"><select className={inputCls} value={form.role} onChange={set("role")}><option value="anggota">Anggota</option><option value="bendahara">Bendahara</option><option value="admin">Admin</option></select></Field>
          </div>
          <button disabled={saving} className={`${btnPrimary} w-full`}>{saving ? "Menyimpan…" : "Simpan"}</button>
        </form>
      </Modal>

      <Modal open={!!viewing} onOpenChange={(o) => !o && setViewing(null)} title="Data Anggota">
        {viewing && (() => {
          const r = viewing as Me & { no_anggota: string | null; maps_url: string | null; nib: string | null; ktp_path: string | null; garasi_path: string | null; unit: unknown };
          const unit = Array.isArray(r.unit) ? (r.unit as string[]) : [];
          const open = async (p: string) => { const { data } = await supabase.storage.from("dokumen").createSignedUrl(p, 120); if (data?.signedUrl) window.open(data.signedUrl, "_blank", "noopener"); };
          const rows: [string, React.ReactNode][] = [
            ["Nomor Login", r.nomor_anggota], ["Nama Lengkap", r.nama_lengkap], ["No. Anggota", r.no_anggota], ["Nama Garasi", r.nama_usaha], ["DPC", r.wilayah],
            ["Google Maps", r.maps_url ? <a className="text-primary underline" href={r.maps_url} target="_blank" rel="noopener noreferrer">Buka peta</a> : null],
            ["NIB", r.nib], ["Status", <StatusBadge status={r.status} />], ["Role", r.role.toUpperCase()],
            ["KTP / SIM", r.ktp_path ? <button className={btnSecondary} onClick={() => open(r.ktp_path!)}><Eye className="h-4 w-4" /> Lihat</button> : null],
            ["Foto Garasi", r.garasi_path ? <button className={btnSecondary} onClick={() => open(r.garasi_path!)}><Eye className="h-4 w-4" /> Lihat</button> : null],
          ];
          return (
            <div className="max-h-[75vh] space-y-3 overflow-y-auto pr-1 text-sm">
              {rows.map(([k, v]) => <div key={k}><div className="text-xs uppercase text-muted-foreground">{k}</div><div className="font-medium">{v || "-"}</div></div>)}
              <div><div className="text-xs uppercase text-muted-foreground">Data Unit ({unit.length})</div>
                {unit.length ? <ol className="ml-5 list-decimal">{unit.map((u, i) => <li key={i}>{u}</li>)}</ol> : "-"}</div>
            </div>
          );
        })()}
      </Modal>

      <Modal open={!!cred} onOpenChange={(o) => !o && setCred(null)} title="Password Akun">
        {cred && (
          <div className="space-y-4">
            <p className="text-sm">Password untuk <b>{cred.nomor_anggota}</b>:</p>
            <div className="flex items-center justify-between rounded-lg border border-primary bg-background p-4 font-mono text-2xl font-bold text-primary">
              {cred.password}
              <button className={btnSecondary} onClick={() => { navigator.clipboard.writeText(`${cred.nomor_anggota} / ${cred.password}`); toast.success("Disalin"); }}><Copy className="h-4 w-4" /></button>
            </div>
            <p className="text-sm text-muted-foreground">Simpan password ini. Password hanya ditampilkan sekali.</p>
          </div>
        )}
      </Modal>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader><AlertDialogTitle>Yakin ingin menghapus anggota ini?</AlertDialogTitle></AlertDialogHeader>
          <p className="text-sm text-muted-foreground">{toDelete?.nama_lengkap} ({toDelete?.nomor_anggota})</p>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={async () => {
              try { await del({ data: { id: toDelete!.id } }); toast.success("Anggota dihapus"); qc.invalidateQueries({ queryKey: ["anggota-list"] }); } catch (e) { toast.error((e as Error).message); }
            }}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
