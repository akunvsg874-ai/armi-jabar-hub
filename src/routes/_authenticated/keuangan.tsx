import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { transaksiQuery } from "@/lib/queries";
import { KATEGORI, KATEGORI_LABEL, formatRupiah, formatTanggal } from "@/lib/armi";
import { PageTitle, Table, td, Modal, inputCls, btnPrimary, btnSecondary, btnDanger, TipeBadge } from "@/components/portal/ui";
import { TransaksiForm } from "@/components/portal/TransaksiForm";
import { EmptyState } from "@/components/site/shared";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { Database } from "@/integrations/supabase/types";

type Trx = Database["public"]["Tables"]["transaksi"]["Row"];

export const Route = createFileRoute("/_authenticated/keuangan")({
  beforeLoad: ({ context }) => { if (context.me.role === "anggota") throw redirect({ to: "/dashboard" }); },
  head: () => ({ meta: [{ title: "Keuangan — Portal ARMI Jabar" }, { name: "description", content: "Laporan keuangan organisasi." }] }),
  component: Page,
});

function Page() {
  const { me } = Route.useRouteContext();
  const qc = useQueryClient();
  const { data = [] } = useQuery(transaksiQuery);
  const [kat, setKat] = useState(""); const [tipe, setTipe] = useState(""); const [bulan, setBulan] = useState("");
  const [open, setOpen] = useState(false); const [editing, setEditing] = useState<Trx | null>(null);
  const [toDelete, setToDelete] = useState<Trx | null>(null);

  const filtered = useMemo(() => data.filter((t) => (!kat || t.kategori === kat) && (!tipe || t.tipe === tipe) && (!bulan || t.tanggal.startsWith(bulan))), [data, kat, tipe, bulan]);
  const byMonth = useMemo(() => data.filter((t) => !bulan || t.tanggal.startsWith(bulan)), [data, bulan]);

  return (
    <>
      <PageTitle title="Keuangan" desc="Laporan pemasukan & pengeluaran organisasi"
        action={<button className={btnPrimary} onClick={() => { setEditing(null); setOpen(true); }}><Plus className="h-4 w-4" /> Tambah Transaksi</button>} />
      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {KATEGORI.map((k) => {
          const rows = byMonth.filter((t) => t.kategori === k);
          const masuk = rows.filter((t) => t.tipe === "pemasukan").reduce((s, t) => s + Number(t.nominal), 0);
          const keluar = rows.filter((t) => t.tipe === "pengeluaran").reduce((s, t) => s + Number(t.nominal), 0);
          return (
            <div key={k} className="rounded-lg border border-border bg-card p-5">
              <div className="text-xs font-bold uppercase tracking-widest text-primary">{KATEGORI_LABEL[k]}</div>
              <div className="mt-3 flex justify-between text-sm"><span className="text-muted-foreground">Masuk</span><span className="text-success">{formatRupiah(masuk)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Keluar</span><span className="text-destructive">{formatRupiah(keluar)}</span></div>
              <div className="mt-2 border-t border-border pt-2 text-2xl font-extrabold tracking-tight">{formatRupiah(masuk - keluar)}</div>
            </div>
          );
        })}
      </div>
      <div className="mb-4 grid gap-2 md:grid-cols-3">
        <select className={inputCls} value={kat} onChange={(e) => setKat(e.target.value)}><option value="">Semua kategori</option>{KATEGORI.map((k) => <option key={k} value={k}>{KATEGORI_LABEL[k]}</option>)}</select>
        <select className={inputCls} value={tipe} onChange={(e) => setTipe(e.target.value)}><option value="">Semua tipe</option><option value="pemasukan">Pemasukan</option><option value="pengeluaran">Pengeluaran</option></select>
        <input type="month" className={inputCls} value={bulan} onChange={(e) => setBulan(e.target.value)} />
      </div>
      {filtered.length ? (
        <Table head={["Tanggal", "Kategori", "Sub-Kategori", "Tipe", "Nominal", "Keterangan", "Input", "Aksi"]}>
          {filtered.map((t) => (
            <tr key={t.id}>
              <td className={`${td} whitespace-nowrap`}>{formatTanggal(t.tanggal)}</td>
              <td className={td}>{KATEGORI_LABEL[t.kategori]}</td>
              <td className={td}>{t.sub_kategori}</td>
              <td className={td}><TipeBadge tipe={t.tipe} /></td>
              <td className={`${td} whitespace-nowrap font-semibold`}>{formatRupiah(Number(t.nominal))}</td>
              <td className={td}>{t.keterangan ?? "-"}</td>
              <td className={`${td} font-mono text-xs`}>{t.input_by}</td>
              <td className={td}><div className="flex gap-1">
                <button className={btnSecondary} onClick={() => { setEditing(t); setOpen(true); }}><Pencil className="h-4 w-4" /></button>
                <button className={btnDanger} onClick={() => setToDelete(t)}><Trash2 className="h-4 w-4" /></button>
              </div></td>
            </tr>
          ))}
        </Table>
      ) : <EmptyState text="Tidak ada transaksi" />}
      <Modal open={open} onOpenChange={setOpen} title={editing ? "Edit Transaksi" : "Tambah Transaksi"}>
        <TransaksiForm key={editing?.id ?? "new"} initial={editing} nomor={me.nomor_anggota} isAdmin={me.role === "admin"} onDone={() => setOpen(false)} />
      </Modal>
      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader><AlertDialogTitle>Yakin ingin menghapus transaksi ini?</AlertDialogTitle></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground" onClick={async () => {
              await supabase.from("transaksi").delete().eq("id", toDelete!.id); qc.invalidateQueries({ queryKey: ["transaksi"] });
            }}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
