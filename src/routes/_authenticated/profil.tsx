import { createFileRoute } from "@tanstack/react-router";
import { FOTO_PROFIL } from "@/lib/armi";
import { PageTitle } from "@/components/portal/ui";
import { StatusBadge } from "@/components/site/shared";

export const Route = createFileRoute("/_authenticated/profil")({
  head: () => ({ meta: [{ title: "Profil Saya — Portal ARMI Jabar" }, { name: "description", content: "Data profil anggota ARMI." }] }),
  component: Profil,
});

function Profil() {
  const { me } = Route.useRouteContext();
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
    </>
  );
}
