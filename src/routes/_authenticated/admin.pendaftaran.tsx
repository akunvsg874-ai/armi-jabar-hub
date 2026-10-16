import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageTitle, inputCls, btnDanger } from "@/components/portal/ui";
import { EmptyState } from "@/components/site/shared";

export const Route = createFileRoute("/_authenticated/admin/pendaftaran")({
  beforeLoad: ({ context }) => { if (context.me.role !== "admin") throw redirect({ to: "/dashboard" }); },
  head: () => ({ meta: [{ title: "Pendaftaran Anggota — Portal ARMI Jabar" }, { name: "description", content: "Calon anggota dari formulir Gabung." }] }),
  component: Page,
});

const STATUS = ["baru", "dihubungi", "diterima", "ditolak"] as const;

function Page() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["pendaftaran"], queryFn: async () => (await supabase.from("pendaftaran").select("*").order("created_at", { ascending: false })).data ?? [] });
  const refresh = () => qc.invalidateQueries({ queryKey: ["pendaftaran"] });
  return (
    <>
      <PageTitle title="Pendaftaran Anggota" desc="Masuk dari formulir Gabung Menjadi Anggota. Setelah diverifikasi, buat akunnya di Kelola Anggota." />
      {data.length ? (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-card text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="p-3">Tanggal</th><th className="p-3">Nama</th><th className="p-3">No HP</th><th className="p-3">Usaha</th><th className="p-3">Wilayah</th><th className="p-3">Unit</th><th className="p-3">Pesan</th><th className="p-3">Status</th><th /></tr>
            </thead>
            <tbody>
              {data.map((p) => (
                <tr key={p.id} className="border-t border-border align-top">
                  <td className="p-3 whitespace-nowrap">{new Date(p.created_at).toLocaleDateString("id-ID")}</td>
                  <td className="p-3 font-semibold">{p.nama}</td>
                  <td className="p-3"><a className="text-primary" href={`https://wa.me/${p.no_hp.replace(/\D/g, "").replace(/^0/, "62")}`} target="_blank" rel="noreferrer">{p.no_hp}</a></td>
                  <td className="p-3">{p.nama_usaha}</td>
                  <td className="p-3">{p.wilayah}</td>
                  <td className="p-3">{p.jumlah_unit ?? "—"}</td>
                  <td className="max-w-xs p-3 text-muted-foreground">{p.pesan ?? "—"}</td>
                  <td className="p-3">
                    <select className={inputCls} value={p.status} onChange={async (e) => { await supabase.from("pendaftaran").update({ status: e.target.value }).eq("id", p.id); refresh(); }}>
                      {STATUS.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="p-3"><button className={btnDanger} aria-label="Hapus" onClick={async () => { if (!confirm("Hapus pendaftaran ini?")) return; await supabase.from("pendaftaran").delete().eq("id", p.id); refresh(); }}><Trash2 className="h-4 w-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <EmptyState text="Belum ada pendaftaran" />}
    </>
  );
}
