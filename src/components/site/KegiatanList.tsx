import { useState } from "react";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { PublicLayout, PageHero } from "@/components/site/PublicLayout";
import { KegiatanCard, EmptyState, type Kegiatan } from "@/components/site/shared";
import { KegiatanDetail } from "@/components/site/KegiatanDetail";
import { kegiatanQuery } from "@/lib/queries";
import { halamanQuery } from "@/lib/cms";
import { todayISO } from "@/lib/armi";
import convoyImg from "@/assets/convoy.jpg";

/** Shared body for Agenda (non-eksekusi) and Jadwal Eksekusi pages. */
export function KegiatanList({ slug, eksekusi }: { slug: "agenda" | "jadwal-eksekusi"; eksekusi: boolean }) {
  const { data: h } = useSuspenseQuery(halamanQuery(slug));
  const { data = [], isLoading } = useQuery(kegiatanQuery);
  const [view, setView] = useState<Kegiatan | null>(null);
  const list = data.filter((k) => (k.jenis === "EKSEKUSI") === eksekusi);
  const today = todayISO();
  const upcoming = list.filter((k) => k.tanggal >= today).sort((a, b) => a.tanggal.localeCompare(b.tanggal));
  const past = list.filter((k) => k.tanggal < today);
  return (
    <PublicLayout>
      <PageHero image={h.hero_image || convoyImg} eyebrow={h.hero_eyebrow} title={h.hero_title} desc={h.hero_desc} />
      <section className="mx-auto max-w-7xl px-5 py-16">
        {isLoading ? <p className="text-muted-foreground">Memuat…</p> : (
          <>
            <h2 className="mb-6 text-2xl font-black uppercase tracking-wide">Mendatang</h2>
            {upcoming.length ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">{upcoming.map((k) => <KegiatanCard key={k.id} k={k} onView={() => setView(k)} />)}</div>
            ) : <EmptyState text="Belum ada jadwal mendatang" />}
            {past.length > 0 && (
              <>
                <h2 className="mb-6 mt-16 text-2xl font-black uppercase tracking-wide">Arsip</h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">{past.map((k) => <KegiatanCard key={k.id} k={k} onView={() => setView(k)} />)}</div>
              </>
            )}
          </>
        )}
      </section>
      <KegiatanDetail k={view} onOpenChange={(o) => !o && setView(null)} />
    </PublicLayout>
  );
}
