import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, KeyRound, Copy } from "lucide-react";
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

type Form = { nama_lengkap: string; no_hp: string; wilayah: string; nama_usaha: string; status: "aktif" | "non_aktif"; role: "admin" | "bendahara" | "anggota" };
const empty: Form = { nama_lengkap: "", no_hp: "", wilayah: "Kota Bandung", nama_usaha: "", status: "aktif", role: "anggota" };

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
    setForm({ nama_lengkap: a.nama_lengkap, no_hp: a.no_hp, wilayah: a.wilayah, nama_usaha: a.nama_usaha, status: a.status, role: a.role });
    setOpen(true);
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nama_lengkap.trim() || !form.no_hp.trim() || !form.nama_usaha.trim()) return toast.error("Lengkapi semua data");
    setSaving(true);
    try {
      if (editing) { await update({ data: { ...form, id: editing.id } as never }); toast.success("Anggota diperbarui"); }
      else { const r = await create({ data: form as never }); setCred(r); }
      setOpen(false); qc.invalidateQueries({ queryKey: ["anggota-list"] });
    } catch (err) { toast.error((err as Error).message); } finally { setSaving(false); }
  }

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <>
      <PageTitle title="Kelola Anggota" desc={`${data.length} anggota terdaftar`} action={<button className={btnPrimary} onClick={openAdd}><Plus className="h-4 w-4" /> Tambah Anggota</button>} />
      <div className="mb-4 grid gap-2 md:grid-cols-[2fr_1fr_1fr]">
        <input className={inputCls} placeholder="Cari nama, usaha, nomor, HP…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className={inputCls} value={fw} onChange={(e) => setFw(e.target.value)}><option value="">Semua wilayah</option>{WILAYAH_JABAR.map((w) => <option key={w}>{w}</option>)}</select>
        <select className={inputCls} value={fs} onChange={(e) => setFs(e.target.value)}><option value="">Semua status</option><option value="aktif">Aktif</option><option value="non_aktif">Non-aktif</option></select>
      </div>
      <Table head={["Nomor", "Nama", "HP", "Wilayah", "Usaha", "Status", "Role", "Aksi"]}>
        {list.map((a) => (
          <tr key={a.id}>
            <td className={`${td} whitespace-nowrap font-mono text-xs`}>{a.nomor_anggota}</td>
            <td className={`${td} font-semibold`}>{a.nama_lengkap}</td>
            <td className={td}>{a.no_hp}</td>
            <td className={td}>{a.wilayah}</td>
            <td className={td}>{a.nama_usaha}</td>
            <td className={td}><StatusBadge status={a.status} /></td>
            <td className={`${td} uppercase text-xs font-bold`}>{a.role}</td>
            <td className={td}>
              <div className="flex gap-1">
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
        <form onSubmit={submit} className="space-y-3">
          <Field label="Nomor Anggota (otomatis)"><input className={`${inputCls} opacity-70`} value={preview} readOnly /></Field>
          <Field label="Nama Lengkap"><input className={inputCls} value={form.nama_lengkap} onChange={set("nama_lengkap")} maxLength={100} /></Field>
          <Field label="No. HP"><input className={inputCls} value={form.no_hp} onChange={set("no_hp")} maxLength={20} /></Field>
          <Field label="Wilayah"><select className={inputCls} value={form.wilayah} onChange={set("wilayah")}>{WILAYAH_JABAR.map((w) => <option key={w}>{w}</option>)}</select></Field>
          <Field label="Nama Usaha"><input className={inputCls} value={form.nama_usaha} onChange={set("nama_usaha")} maxLength={100} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Status"><select className={inputCls} value={form.status} onChange={set("status")}><option value="aktif">Aktif</option><option value="non_aktif">Non-aktif</option></select></Field>
            <Field label="Role"><select className={inputCls} value={form.role} onChange={set("role")}><option value="anggota">Anggota</option><option value="bendahara">Bendahara</option><option value="admin">Admin</option></select></Field>
          </div>
          <button disabled={saving} className={`${btnPrimary} w-full`}>{saving ? "Menyimpan…" : "Simpan"}</button>
        </form>
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
