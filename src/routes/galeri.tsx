import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PublicLayout, PageHero } from "@/components/site/PublicLayout";
import { EmptyState } from "@/components/site/shared";
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
  return (
    <PublicLayout>
      <PageHero image={h.hero_image || communityImg} eyebrow={h.hero_eyebrow} title={h.hero_title} desc={h.hero_desc} />
      <section className="mx-auto max-w-7xl px-5 py-16">
        {foto.length ? (
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
            {foto.map((f) => (
              <figure key={f.id} className="group relative mb-4 break-inside-avoid overflow-hidden rounded-lg border border-border">
                <img src={f.gambar} alt={f.judul || "Foto kegiatan ARMI"} loading="lazy" className="w-full transition-transform duration-500 group-hover:scale-105" />
                {f.judul && <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 to-transparent p-4 text-sm font-bold uppercase tracking-wider">{f.judul}</figcaption>}
              </figure>
            ))}
          </div>
        ) : <EmptyState text="Belum ada foto di galeri" />}
      </section>
    </PublicLayout>
  );
}
