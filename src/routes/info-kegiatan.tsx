import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PublicLayout, PageHeading } from "@/components/site/PublicLayout";
import { KegiatanCard, EmptyState } from "@/components/site/shared";
import { kegiatanQuery } from "@/lib/queries";

export const Route = createFileRoute("/info-kegiatan")({
  head: () => ({
    meta: [
      { title: "Kegiatan — ARMI DPD Jawa Barat" },
      { name: "description", content: "Agenda sosial, kopdar, eksekusi, dan anniversary DPD ARMI Jawa Barat." },
      { property: "og:title", content: "Kegiatan ARMI DPD Jawa Barat" },
      { property: "og:description", content: "Agenda kegiatan DPD ARMI Jawa Barat." },
    ],
  }),
  component: Page,
});

function Page() {
  const { data, isLoading } = useQuery(kegiatanQuery);
  return (
    <PublicLayout>
      <section className="mx-auto max-w-7xl px-4 py-16">
        <PageHeading eyebrow="Agenda" title="Informasi Kegiatan" desc="Kegiatan sosial, kopdar, eksekusi, dan anniversary DPD ARMI Jawa Barat." />
        {isLoading ? <p className="text-muted-foreground">Memuat…</p> : data?.length ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.map((k) => <KegiatanCard key={k.id} k={k} />)}
          </div>
        ) : <EmptyState text="Belum ada kegiatan" />}
      </section>
    </PublicLayout>
  );
}
