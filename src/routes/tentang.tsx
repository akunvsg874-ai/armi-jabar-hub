import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { HeartHandshake, Shield, BadgeCheck } from "lucide-react";
import { PublicLayout, PageHero } from "@/components/site/PublicLayout";
import { ProgramCards } from "@/components/site/shared";
import { halamanQuery, seoMeta } from "@/lib/cms";
import convoyImg from "@/assets/convoy.jpg";
import communityImg from "@/assets/community.jpg";

export const Route = createFileRoute("/tentang")({
  loader: ({ context }) => context.queryClient.ensureQueryData(halamanQuery("tentang")),
  head: ({ loaderData }) => seoMeta(loaderData, "tentang"),
  component: Page,
});

function Page() {
  const { data: h } = useSuspenseQuery(halamanQuery("tentang"));
  return (
    <PublicLayout>
      <PageHero image={h.hero_image || convoyImg} eyebrow={h.hero_eyebrow} title={h.hero_title} desc={h.hero_desc} />

      {h.konten.map((s, i) => {
        const lines = s.isi.split("\n").filter(Boolean);
        const img = s.gambar || (i === 0 ? communityImg : "");
        return (
          <section key={s.judul + i} className={i % 2 === 0 ? "bg-ivory text-ink" : "border-b border-border"}>
            <div className={`mx-auto grid max-w-7xl gap-12 px-5 py-20 ${img ? "lg:grid-cols-2 lg:items-center" : ""}`}>
              <div className={img && i % 2 ? "lg:order-2" : ""}>
                <h2 className="accent-bar text-3xl font-bold uppercase md:text-4xl">{s.judul}</h2>
                {lines.length > 1 ? (
                  <ol className={`mt-5 space-y-3 text-[15px] ${i % 2 === 0 ? "text-ink-muted" : "text-muted-foreground"}`}>
                    {lines.map((m, j) => <li key={j} className="flex gap-3"><span className="font-bold text-primary">{String(j + 1).padStart(2, "0")}</span>{m}</li>)}
                  </ol>
                ) : <p className={`mt-5 text-lg leading-relaxed ${i % 2 === 0 ? "text-ink-muted" : "text-muted-foreground"}`}>{s.isi}</p>}
              </div>
              {img && <img src={img} alt={s.judul} loading="lazy" className="aspect-[4/3] w-full rounded-lg object-cover" />}
            </div>
          </section>
        );
      })}

      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {[{ i: HeartHandshake, t: "Kebersamaan" }, { i: Shield, t: "Keamanan" }, { i: BadgeCheck, t: "Profesionalitas" }].map((v) => (
            <div key={v.t} className="flex items-center gap-4 border-l-2 border-primary pl-5">
              <v.i className="h-6 w-6 text-primary" /><span className="text-lg font-bold">{v.t}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-card py-20">
        <div className="mx-auto max-w-7xl px-5">
          <h2 className="accent-bar mb-10 text-3xl font-bold uppercase md:text-4xl">Program Utama</h2>
          <ProgramCards />
          <div className="mt-12">
            <Link to="/gabung" className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-dark">Gabung Menjadi Anggota</Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
