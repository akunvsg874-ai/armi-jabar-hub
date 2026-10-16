import { Calendar, MapPin, Shield, Users, FileBadge } from "lucide-react";
import { JENIS_BADGE, formatTanggal, type JenisKegiatan } from "@/lib/armi";
import type { Database } from "@/integrations/supabase/types";

export type Kegiatan = Database["public"]["Tables"]["kegiatan"]["Row"];

export function JenisBadge({ jenis }: { jenis: JenisKegiatan }) {
  return <span className={`rounded-md px-2 py-0.5 text-xs font-bold tracking-wider ${JENIS_BADGE[jenis]}`}>{jenis}</span>;
}

export function StatusBadge({ status }: { status: "aktif" | "non_aktif" }) {
  return status === "aktif" ? (
    <span className="rounded-md bg-success/20 px-2 py-0.5 text-xs font-semibold text-success">Aktif</span>
  ) : (
    <span className="rounded-md bg-destructive/20 px-2 py-0.5 text-xs font-semibold text-destructive">Non-aktif</span>
  );
}

export function KegiatanCard({ k, actions }: { k: Kegiatan; actions?: React.ReactNode }) {
  return (
    <article className="group overflow-hidden rounded-xl border border-border bg-card transition hover:border-primary">
      <div className="relative overflow-hidden">
        <img src={k.foto} alt={k.judul} loading="lazy" width={600} height={400} className="aspect-[3/2] w-full object-cover transition group-hover:scale-105" />
        <div className="absolute left-3 top-3"><JenisBadge jenis={k.jenis} /></div>
      </div>
      <div className="space-y-2 p-5">
        <h3 className="text-xl font-extrabold uppercase leading-tight">{k.judul}</h3>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-primary" />{formatTanggal(k.tanggal)}</span>
          <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-primary" />{k.lokasi}</span>
        </div>
        <p className="line-clamp-3 text-sm text-muted-foreground">{k.deskripsi}</p>
        {actions && <div className="flex gap-2 pt-2">{actions}</div>}
      </div>
    </article>
  );
}

const PROGRAMS = [
  { icon: Shield, title: "Keamanan & Pandawa Korlap", desc: "Tim koordinator lapangan siaga 24/7 membantu penanganan unit bermasalah dan pengamanan armada anggota." },
  { icon: Users, title: "Jaringan & Sub-Driver", desc: "Jejaring antar rental se-Jawa Barat untuk berbagi unit, order, dan pengemudi terpercaya." },
  { icon: FileBadge, title: "Legalitas & Kemitraan", desc: "Pendampingan legalitas usaha serta kemitraan dengan instansi, leasing, dan asuransi." },
];

export function ProgramCards() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {PROGRAMS.map((p) => (
        <div key={p.title} className="relative overflow-hidden rounded-xl border border-border bg-card p-6">
          <div className="absolute right-0 top-0 h-16 w-16 racing-stripe opacity-10" />
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <p.icon className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-extrabold uppercase">{p.title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">{text}</div>;
}
