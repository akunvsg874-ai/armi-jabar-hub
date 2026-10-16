import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Users, Wallet, CalendarDays, Plus, Search, TrendingUp, TrendingDown } from "lucide-react";
import { anggotaListQuery, kegiatanQuery, transaksiQuery } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { FOTO_PROFIL, KATEGORI, KATEGORI_LABEL, formatRupiah, formatTanggal, todayISO } from "@/lib/armi";
import { PageTitle, StatCard, Table, td, TipeBadge, Modal, btnPrimary, inputCls } from "@/components/portal/ui";
import { TransaksiForm } from "@/components/portal/TransaksiForm";
import { JenisBadge, StatusBadge, EmptyState } from "@/components/site/shared";
import type { Me } from "@/lib/session";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Portal ARMI Jabar" }, { name: "description", content: "Dashboard portal ARMI DPD Jawa Barat." }] }),
  component: Dashboard,
});

function Dashboard() {
  const { me } = Route.useRouteContext();
  return (
    <>
      <PageTitle title={`Halo, ${me.nama_lengkap.split(" ")[0]}`} desc="Selamat datang di portal ARMI DPD Jawa Barat." />
      {me.role === "admin" && <AdminDash />}
      {me.role === "bendahara" && <BendaharaDash me={me} />}
      {me.role === "anggota" && <AnggotaDash me={me} />}
    </>
  );
}

function Upcoming({ limit }: { limit?: number }) {
  const { data = [] } = useQuery(kegiatanQuery);
  const list = data.filter((k) => k.tanggal >= todayISO()).sort((a, b) => a.tanggal.localeCompare(b.tanggal)).slice(0, limit);
  if (!list.length) return <EmptyState text="Belum ada kegiatan mendatang" />;
  return (
    <div className="space-y-2">
      {list.map((k) => (
        <div key={k.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3">
          <div>
            <div className="font-bold">{k.judul}</div>
            <div className="text-xs text-muted-foreground">{formatTanggal(k.tanggal)} · {k.lokasi}</div>
          </div>
          <JenisBadge jenis={k.jenis} />
        </div>
      ))}
    </div>
  );
}

function TrxTable({ limit }: { limit: number }) {
  const { data = [] } = useQuery(transaksiQuery);
  return (
    <Table head={["Tanggal", "Kategori", "Sub", "Tipe", "Nominal"]}>
      {data.slice(0, limit).map((t) => (
        <tr key={t.id}>
          <td className={`${td} whitespace-nowrap`}>{formatTanggal(t.tanggal)}</td>
          <td className={td}>{KATEGORI_LABEL[t.kategori]}</td>
          <td className={td}>{t.sub_kategori}</td>
          <td className={td}><TipeBadge tipe={t.tipe} /></td>
          <td className={`${td} whitespace-nowrap font-semibold`}>{formatRupiah(Number(t.nominal))}</td>
        </tr>
      ))}
    </Table>
  );
}

function AdminDash() {
  const { data: anggota = [] } = useQuery(anggotaListQuery);
  const { data: trx = [] } = useQuery(transaksiQuery);
  const { data: keg = [] } = useQuery(kegiatanQuery);
  const bulan = todayISO().slice(0, 7);
  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total Anggota" value={anggota.length} icon={<Users className="h-5 w-5" />} />
        <StatCard label="Transaksi Bulan Ini" value={trx.filter((t) => t.tanggal.startsWith(bulan)).length} icon={<Wallet className="h-5 w-5" />} />
        <StatCard label="Kegiatan Mendatang" value={keg.filter((k) => k.tanggal >= todayISO()).length} icon={<CalendarDays className="h-5 w-5" />} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <section><h2 className="mb-3 text-xl font-bold">5 Transaksi Terbaru</h2><TrxTable limit={5} /></section>
        <section><h2 className="mb-3 text-xl font-bold">Kegiatan Mendatang</h2><Upcoming limit={3} /></section>
      </div>
    </div>
  );
}

function BendaharaDash({ me }: { me: Me }) {
  const { data: trx = [] } = useQuery(transaksiQuery);
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <button className={btnPrimary} onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Tambah Transaksi</button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {KATEGORI.map((k) => {
          const rows = trx.filter((t) => t.kategori === k);
          const masuk = rows.filter((t) => t.tipe === "pemasukan").reduce((s, t) => s + Number(t.nominal), 0);
          const keluar = rows.filter((t) => t.tipe === "pengeluaran").reduce((s, t) => s + Number(t.nominal), 0);
          return (
            <div key={k} className="rounded-lg border border-border bg-card p-5">
              <div className="text-xs font-bold uppercase tracking-widest text-primary">{KATEGORI_LABEL[k]}</div>
              <div className="mt-3 flex items-center gap-2 text-sm text-success"><TrendingUp className="h-4 w-4" />{formatRupiah(masuk)}</div>
              <div className="flex items-center gap-2 text-sm text-destructive"><TrendingDown className="h-4 w-4" />{formatRupiah(keluar)}</div>
              <div className="mt-2 text-2xl font-extrabold tracking-tight">{formatRupiah(masuk - keluar)}</div>
            </div>
          );
        })}
      </div>
      <section><h2 className="mb-3 text-xl font-bold">10 Transaksi Terbaru</h2><TrxTable limit={10} /></section>
      <Modal open={open} onOpenChange={setOpen} title="Tambah Transaksi">
        <TransaksiForm nomor={me.nomor_anggota} isAdmin={false} onDone={() => setOpen(false)} />
      </Modal>
    </div>
  );
}

function AnggotaDash({ me }: { me: Me }) {
  const [q, setQ] = useState("");
  const [term, setTerm] = useState<string | null>(null);
  const { data: hasil = [], isFetching } = useQuery({
    queryKey: ["blacklist-search", term],
    enabled: term !== null,
    queryFn: async () => (await supabase.rpc("cari_blacklist", { q: term ?? "" })).data ?? [],
  });
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1.4fr]">
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <img src={FOTO_PROFIL} alt="Foto profil" width={80} height={80} className="h-20 w-20 rounded-lg" />
          <div>
            <div className="text-xl font-bold">{me.nama_lengkap}</div>
            <div className="text-sm text-muted-foreground">{me.nomor_anggota}</div>
            <div className="mt-1"><StatusBadge status={me.status} /></div>
          </div>
        </div>
        <dl className="mt-4 space-y-1 text-sm">
          <div className="flex justify-between"><dt className="text-muted-foreground">Usaha</dt><dd className="font-semibold">{me.nama_usaha}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Wilayah</dt><dd className="font-semibold">{me.wilayah}</dd></div>
        </dl>
      </div>
      <div className="space-y-6">
        <section className="rounded-lg border border-border bg-card p-6">
          <h2 className="mb-3 text-xl font-bold">Cek Blacklist Cepat</h2>
          <form onSubmit={(e) => { e.preventDefault(); setTerm(q.trim()); }} className="flex gap-2">
            <input className={inputCls} placeholder="Nama / NIK / wilayah" value={q} onChange={(e) => setQ(e.target.value)} />
            <button className={btnPrimary}><Search className="h-4 w-4" /></button>
          </form>
          {term !== null && !isFetching && (
            <div className="mt-3 space-y-2">
              {hasil.length ? hasil.map((b) => (
                <div key={b.id} className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">
                  <div className="font-bold">{b.nama_konsumen} <span className="font-normal text-muted-foreground">· {b.wilayah}</span></div>
                  <div className="text-muted-foreground">{b.keterangan}</div>
                </div>
              )) : <p className="text-sm text-muted-foreground">Tidak ada data ditemukan</p>}
              <Link to="/blacklist" className="text-sm text-primary">Buka halaman blacklist →</Link>
            </div>
          )}
        </section>
        <section><h2 className="mb-3 text-xl font-bold">Kegiatan Mendatang</h2><Upcoming limit={5} /></section>
      </div>
    </div>
  );
}
