import { useState } from "react";
import { Calendar, Clock, MapPin, Users, Phone, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Lightbox } from "@/components/site/Lightbox";
import { JenisBadge, type Kegiatan } from "@/components/site/shared";
import { formatTanggal } from "@/lib/armi";

export function fotoKegiatan(k: Kegiatan): string[] {
  const extra = Array.isArray(k.dokumentasi) ? (k.dokumentasi as unknown[]).filter((x): x is string => typeof x === "string" && !!x) : [];
  return [k.foto, ...extra].filter(Boolean);
}

function Info({ icon: Icon, label, children }: { icon: typeof Calendar; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 rounded-md border border-border bg-background/40 p-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="break-words text-sm font-semibold">{children}</div>
      </div>
    </div>
  );
}

/** Professional detail modal for a kegiatan, with photo gallery + lightbox. */
export function KegiatanDetail({ k, onOpenChange }: { k: Kegiatan | null; onOpenChange: (o: boolean) => void }) {
  const [lb, setLb] = useState<number | null>(null);
  if (!k) return null;
  const fotos = fotoKegiatan(k);
  return (
    <>
      <Dialog open={!!k} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto border-border bg-card p-0">
          <button type="button" onClick={() => setLb(0)} className="group relative block w-full overflow-hidden">
            <img src={fotos[0]} alt={k.judul} className="aspect-[16/8] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-left">
              <JenisBadge jenis={k.jenis} />
              <DialogTitle className="mt-3 text-2xl font-black uppercase leading-tight md:text-3xl">{k.judul}</DialogTitle>
            </div>
          </button>
          <div className="space-y-6 p-6 pt-2">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Info icon={Calendar} label="Tanggal">{formatTanggal(k.tanggal)}</Info>
              {k.waktu && <Info icon={Clock} label="Waktu">{k.waktu}</Info>}
              <Info icon={MapPin} label="Lokasi">
                {k.lokasi}
                {k.alamat && <span className="block text-xs font-normal text-muted-foreground">{k.alamat}</span>}
              </Info>
              {k.penyelenggara && <Info icon={Users} label="Penyelenggara">{k.penyelenggara}</Info>}
              {k.narahubung && <Info icon={Phone} label="Narahubung">{k.narahubung}</Info>}
            </div>
            {k.maps_url && (
              <a href={k.maps_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-primary hover:underline">
                <ExternalLink className="h-4 w-4" /> Buka di Google Maps
              </a>
            )}
            <div>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">Deskripsi Kegiatan</h3>
              <DialogDescription className="whitespace-pre-line text-sm leading-relaxed text-foreground/85">{k.deskripsi}</DialogDescription>
            </div>
            {fotos.length > 1 && (
              <div>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">Dokumentasi ({fotos.length} foto)</h3>
                <div className="grid grid-cols-3 gap-2 md:grid-cols-4">
                  {fotos.map((f, i) => (
                    <button key={i} type="button" onClick={() => setLb(i)} className="overflow-hidden rounded border border-border hover:border-primary">
                      <img src={f} alt={`${k.judul} ${i + 1}`} loading="lazy" className="aspect-square w-full object-cover transition-transform hover:scale-105" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <Lightbox items={fotos.map((src, i) => ({ src, alt: k.judul, caption: `${k.judul} — ${i + 1}` }))} open={lb !== null} onOpenChange={(o) => !o && setLb(null)} startIndex={lb ?? 0} />
    </>
  );
}
