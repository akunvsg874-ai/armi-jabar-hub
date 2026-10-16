import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Maximize2 } from "lucide-react";
import { PublicLayout, PageHero } from "@/components/site/PublicLayout";
import { EmptyState } from "@/components/site/shared";
import { Lightbox } from "@/components/site/Lightbox";
import { galeriQuery, halamanQuery, seoMeta } from "@/lib/cms";
import communityImg from "@/assets/community.jpg";

export const Route = createFileRoute("/galeri")({
  loader: async ({ context }) => {
    const [h] = await Promise.all([context.queryClient.ensureQueryData(halamanQuery("galeri")), context.queryClient.ensureQueryData(galeriQuery)]);
    return h;
  },
  head: ({ loaderData }) => seoMeta(loaderData, "galeri"),
  component: Page,
});

function Page() {
  const { data: h } = useSuspenseQuery(halamanQuery("galeri"));
  const { data: foto } = useSuspenseQuery(galeriQuery);
  const [open, setOpen] = useState(false);
  const [start, setStart] = useState(0);

  const items = foto.map((f) => ({ src: f.gambar, alt: f.judul || "Foto kegiatan ARMI", caption: f.judul || "" }));

  return (
    <PublicLayout>
      <PageHero image={h.hero_image || communityImg} eyebrow={h.hero_eyebrow} title={h.hero_title} desc={h.hero_desc} />
      <section className="mx-auto max-w-7xl px-5 py-16">
        {foto.length ? (
          <>
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              <span className="text-primary">— </span>Klik foto untuk melihat ukuran penuh
            </p>
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
              {foto.map((f, i) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => { setStart(i); setOpen(true); }}
                  aria-label={`Lihat foto: ${f.judul || "Foto kegiatan ARMI"}`}
                  className="group relative mb-4 block w-full cursor-zoom-in break-inside-avoid overflow-hidden rounded-lg border border-border text-left transition-colors hover:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <img src={f.gambar} alt={f.judul || "Foto kegiatan ARMI"} loading="lazy" className="w-full transition-transform duration-500 group-hover:scale-105" />
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/0 opacity-0 transition-all duration-300 group-hover:bg-background/55 group-hover:opacity-100">
                    <span className="inline-flex items-center gap-2 rounded-md border border-primary bg-background/90 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
                      <Maximize2 className="h-3.5 w-3.5" /> Lihat Foto
                    </span>
                  </span>
                  {f.judul && <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent p-4 text-sm font-bold uppercase tracking-wider">{f.judul}</figcaption>}
                </button>
              ))}
            </div>
            <Lightbox items={items} open={open} onOpenChange={setOpen} startIndex={start} />
          </>
        ) : <EmptyState text="Belum ada foto di galeri" />}
      </section>
    </PublicLayout>
  );
}
