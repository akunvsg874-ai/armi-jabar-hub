import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatTanggal } from "@/lib/armi";
import { FOTO_PROFIL } from "@/lib/armi";
import { PageTitle } from "@/components/portal/ui";
import { StatusBadge } from "@/components/site/shared";

export const Route = createFileRoute("/_authenticated/profil")({
  head: () => ({ meta: [{ title: "Profil Saya — Portal ARMI Jabar" }, { name: "description", content: "Data profil anggota ARMI." }] }),
  component: Profil,
});

function Profil() {
  const { me } = Route.useRouteContext();
  const { data: skList = [] } = useQuery({
    queryKey: ["sk-saya", me.id],
    queryFn: async () => (await supabase.from("surat_keputusan").select("id,kode,nomor,jabatan,tanggal_ditetapkan,status").eq("anggota_id", me.id).order("tanggal_ditetapkan", { ascending: false })).data ?? [],
  });
  const rows: [string, React.ReactNode][] = [
    ["Nomor Anggota", me.nomor_anggota],
    ["Nama Lengkap", me.nama_lengkap],
    ["No. HP", me.no_hp],
    ["Wilayah", me.wilayah],
    ["Nama Usaha", me.nama_usaha],
    ["Status", <StatusBadge key="s" status={me.status} />],
    ["Role", <span key="r" className="uppercase">{me.role}</span>],
  ];
  return (
    <>
      <PageTitle title="Profil Saya" desc="Hubungi admin jika ada data yang perlu diperbarui." />
      <div className="max-w-2xl rounded-lg border border-border bg-card p-6">
        <img src={FOTO_PROFIL} alt="Foto profil" width={150} height={150} className="mb-6 h-32 w-32 rounded-lg" />
        <dl className="divide-y divide-border">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-3 text-sm">
              <dt className="text-muted-foreground">{k}</dt><dd className="text-right font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="mt-6 max-w-2xl rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-bold uppercase">SK Saya</h2>
        {skList.length === 0 ? <p className="mt-2 text-sm text-muted-foreground">Belum ada Surat Keputusan atas nama Anda.</p> : (
          <ul className="mt-3 divide-y divide-border">
            {skList.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div><div className="font-semibold">{s.jabatan}</div><div className="font-mono text-xs text-muted-foreground">{s.nomor} · {formatTanggal(s.tanggal_ditetapkan)}{s.status === "dicabut" ? " · Dicabut" : ""}</div></div>
                <a href={`/verifikasi-sk/${s.kode}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-input px-3 py-1.5 text-xs font-semibold hover:border-primary"><ExternalLink className="h-3.5 w-3.5" /> Lihat / Cetak</a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
