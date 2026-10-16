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

export function KegiatanCard({ k, actions, onView }: { k: Kegiatan; actions?: React.ReactNode; onView?: () => void }) {
  return (
    <article className="group overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary">
      <div className={`relative overflow-hidden ${onView ? "cursor-pointer" : ""}`} onClick={onView}>
        <img src={k.foto} alt={k.judul} loading="lazy" width={600} height={400} className="aspect-[3/2] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute left-3 top-3"><JenisBadge jenis={k.jenis} /></div>
      </div>
      <div className="space-y-2 p-5">
        <h3 className={`text-lg font-bold leading-snug ${onView ? "cursor-pointer hover:text-primary" : ""}`} onClick={onView}>{k.judul}</h3>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-primary" />{formatTanggal(k.tanggal)}{k.waktu ? ` · ${k.waktu}` : ""}</span>
          <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-primary" />{k.lokasi}</span>
        </div>
        <p className="line-clamp-3 text-sm text-muted-foreground">{k.deskripsi}</p>
        {(onView || actions) && (
          <div className="flex flex-wrap gap-2 pt-2">
            {onView && (
              <button type="button" onClick={onView} className="inline-flex items-center gap-1 rounded-md border border-primary px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary transition-colors hover:bg-primary hover:text-primary-foreground">
                Lihat Detail →
              </button>
            )}
            {actions}
          </div>
        )}
      </div>
    </article>
  );
}

const PROGRAMS = [
  { icon: Shield, title: "Keamanan & Pandawa Korlap", desc: "Tim koordinator lapangan siaga 24/7 membantu penanganan unit bermasalah dan pengamanan armada anggota." },
  { icon: Users, title: "Jaringan & Sub-Driver", desc: "Jejaring antar rental se-Jawa Barat untuk berbagi unit, order, dan pengemudi terpercaya." },
  { icon: FileBadge, title: "Legalitas & Kemitraan", desc: "Pendampingan legalitas usaha serta kemitraan dengan instansi, leasing, dan asuransi." },
];

export function ProgramCards({ light = false }: { light?: boolean }) {
  const card = light ? "border-ink/10 bg-background/0 hover:border-primary" : "border-border bg-card hover:border-primary";
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {PROGRAMS.map((p, i) => (
        <div key={p.title} className={`group rounded-lg border p-7 transition-colors ${card}`}>
          <div className="flex items-center justify-between">
            <p.icon className="h-7 w-7 text-primary" />
            <span className={`text-xs font-semibold ${light ? "text-ink-muted" : "text-muted-foreground"}`}>0{i + 1}</span>
          </div>
          <h3 className="mt-8 text-xl font-bold">{p.title}</h3>
          <p className={`mt-2 text-[15px] leading-relaxed ${light ? "text-ink-muted" : "text-muted-foreground"}`}>{p.desc}</p>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return <div className="rounded-lg border border-dashed border-border p-10 text-center text-muted-foreground">{text}</div>;
}
