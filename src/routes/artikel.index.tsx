import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PublicLayout, PageHero } from "@/components/site/PublicLayout";
import { EmptyState } from "@/components/site/shared";
import { artikelListQuery, halamanQuery, seoMeta } from "@/lib/cms";
import { formatTanggal } from "@/lib/armi";
import heroImg from "@/assets/hero-cars.jpg";

export const Route = createFileRoute("/artikel/")({
  loader: async ({ context }) => {
    const [h] = await Promise.all([context.queryClient.ensureQueryData(halamanQuery("artikel")), context.queryClient.ensureQueryData(artikelListQuery)]);
    return h;
  },
  head: ({ loaderData }) => seoMeta(loaderData, "artikel"),
  component: Page,
});

function Page() {
  const { data: h } = useSuspenseQuery(halamanQuery("artikel"));
  const { data: list } = useSuspenseQuery(artikelListQuery);
  return (
    <PublicLayout>
      <PageHero image={h.hero_image || heroImg} eyebrow={h.hero_eyebrow} title={h.hero_title} desc={h.hero_desc} />
      <section className="mx-auto max-w-7xl px-5 py-16">
        {list.length ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {list.map((a) => (
              <Link key={a.id} to="/artikel/$slug" params={{ slug: a.slug }} className="group overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary">
                {a.gambar && <img src={a.gambar} alt={a.judul} loading="lazy" className="aspect-[3/2] w-full object-cover transition-transform duration-500 group-hover:scale-105" />}
                <div className="space-y-2 p-5">
                  <div className="text-xs font-bold uppercase tracking-widest text-primary">{formatTanggal(a.tanggal)}</div>
                  <h2 className="text-lg font-bold leading-snug">{a.judul}</h2>
                  <p className="line-clamp-3 text-sm text-muted-foreground">{a.ringkasan}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : <EmptyState text="Belum ada artikel" />}
      </section>
    </PublicLayout>
  );
}
