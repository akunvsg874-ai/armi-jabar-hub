import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { MapPin, Phone, Mail, Info } from "lucide-react";
import { PublicLayout, PageHero } from "@/components/site/PublicLayout";
import { halamanQuery, seoMeta } from "@/lib/cms";
import heroImg from "@/assets/hero-cars.jpg";

export const Route = createFileRoute("/kontak")({
  loader: ({ context }) => context.queryClient.ensureQueryData(halamanQuery("kontak")),
  head: ({ loaderData }) => seoMeta(loaderData, "kontak"),
  component: Page,
});

const ICONS = [MapPin, Phone, Mail];

function Page() {
  const { data: h } = useSuspenseQuery(halamanQuery("kontak"));
  return (
    <PublicLayout>
      <PageHero image={h.hero_image || heroImg} eyebrow={h.hero_eyebrow} title={h.hero_title} desc={h.hero_desc} />
      <section className="mx-auto max-w-5xl px-5 py-16">
        <div className="grid gap-4 md:grid-cols-3">
          {h.konten.map((s, i) => {
            const I = ICONS[i] ?? Info;
            return (
              <div key={s.judul + i} className="rounded-lg border border-border bg-card p-6">
                <I className="mb-3 h-6 w-6 text-primary" />
                <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{s.judul}</div>
                <div className="mt-1 whitespace-pre-line font-semibold">{s.isi}</div>
              </div>
            );
          })}
        </div>
        <div className="mt-10 text-center">
          <Link to="/gabung" className="rounded-md bg-primary px-6 py-3 text-sm font-bold uppercase tracking-[0.2em] text-primary-foreground hover:bg-primary-dark">Gabung Menjadi Anggota</Link>
        </div>
      </section>
    </PublicLayout>
  );
}
