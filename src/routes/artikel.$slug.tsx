import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { artikelQuery } from "@/lib/cms";
import { formatTanggal } from "@/lib/armi";

export const Route = createFileRoute("/artikel/$slug")({
  loader: async ({ context, params }) => {
    const a = await context.queryClient.ensureQueryData(artikelQuery(params.slug));
    if (!a) throw notFound();
    return a;
  },
  head: ({ loaderData: a }) => {
    if (!a) return { meta: [{ title: "Artikel tidak tersedia — ARMI DPD Jawa Barat" }, { name: "robots", content: "noindex" }] };
    const title = a.seo_title || `${a.judul} — ARMI DPD Jawa Barat`;
    const desc = a.seo_description || a.ringkasan;
    const meta: Array<Record<string, string>> = [
      { title }, { name: "description", content: desc },
      { property: "og:title", content: title }, { property: "og:description", content: desc },
      { property: "og:type", content: "article" }, { name: "twitter:card", content: "summary_large_image" },
    ];
    if (a.gambar?.startsWith("https://")) meta.push({ property: "og:image", content: a.gambar }, { name: "twitter:image", content: a.gambar });
    return { meta };
  },
  notFoundComponent: () => (
    <PublicLayout><div className="mx-auto max-w-3xl px-5 py-24 text-center"><h1 className="text-3xl font-black uppercase">Artikel tidak ditemukan</h1><Link to="/artikel" className="mt-6 inline-block text-primary">← Kembali ke artikel</Link></div></PublicLayout>
  ),
  component: Page,
});

function Page() {
  const { slug } = Route.useParams();
  const { data: a } = useSuspenseQuery(artikelQuery(slug));
  if (!a) return null;
  return (
    <PublicLayout>
      <article className="mx-auto max-w-3xl px-5 py-16">
        <Link to="/artikel" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4" /> Artikel</Link>
        <div className="mt-6 text-xs font-bold uppercase tracking-widest text-primary">{formatTanggal(a.tanggal)}</div>
        <h1 className="mt-3 text-4xl font-black uppercase leading-[0.95] md:text-5xl">{a.judul}</h1>
        {a.ringkasan && <p className="mt-4 text-lg text-muted-foreground">{a.ringkasan}</p>}
        {a.gambar && <img src={a.gambar} alt={a.judul} className="mt-8 w-full rounded-lg border border-border" />}
        <div className="mt-8 space-y-4 text-[16px] leading-relaxed">
          {a.isi.split(/\n{2,}/).map((p, i) => <p key={i} className="whitespace-pre-line">{p}</p>)}
        </div>
      </article>
    </PublicLayout>
  );
}
