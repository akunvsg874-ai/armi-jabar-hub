import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Search, Building2, MapPin, X } from "lucide-react";
import { PublicLayout, PageHeading } from "@/components/site/PublicLayout";
import { StatusBadge } from "@/components/site/shared";
import { supabase } from "@/integrations/supabase/client";
import { WILAYAH_JABAR } from "@/lib/armi";
import { halamanQuery, seoMeta } from "@/lib/cms";
import { useSuspenseQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/anggota")({
  loader: ({ context }) => context.queryClient.ensureQueryData(halamanQuery("anggota")),
  head: ({ loaderData }) => seoMeta(loaderData, "anggota"),
  component: Page,
});

function Page() {
  const { data: h } = useSuspenseQuery(halamanQuery("anggota"));
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [wil, setWil] = useState("");
  useEffect(() => { const t = setTimeout(() => setDebounced(q), 300); return () => clearTimeout(t); }, [q]);
  const { data, isLoading } = useQuery({
    queryKey: ["cari-anggota", debounced],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("cari_anggota_publik", { q: debounced });
      if (error) throw error;
      return data;
    },
  });
  const list = (data ?? []).filter((a) => !wil || a.wilayah === wil);
  return (
    <PublicLayout>
      <section className="mx-auto max-w-7xl px-4 py-16">
        <PageHeading eyebrow={h.hero_eyebrow} title={h.hero_title} desc={h.hero_desc} />
        <div className="mb-8 grid gap-3 md:grid-cols-[2fr_1fr]">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama, nama usaha, atau wilayah…"
            className="w-full rounded-md border border-input bg-card py-3 pl-12 pr-4 outline-none focus:border-primary" />
        </div>
        <select value={wil} onChange={(e) => setWil(e.target.value)} aria-label="Filter wilayah" className="rounded-md border border-input bg-card px-3 py-3 outline-none focus:border-primary">
          <option value="">Semua wilayah</option>
          {WILAYAH_JABAR.map((w) => <option key={w}>{w}</option>)}
        </select>
        </div>
        {isLoading ? <p className="text-muted-foreground">Mencari…</p> : list.length ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {list.map((a) => (
              <div key={a.nomor_anggota} className="rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/60">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-bold">{a.nama_lengkap}</h3>
                  <StatusBadge status={a.status} />
                </div>
                <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><Building2 className="h-4 w-4 text-primary" />{a.nama_usaha}</p>
                <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4 text-primary" />{a.wilayah}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-12 text-center">
            <p className="font-semibold">Tidak ada anggota ditemukan</p>
            {(q || wil) && <button onClick={() => { setQ(""); setWil(""); }} className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-input px-4 py-2 text-sm hover:border-foreground"><X className="h-4 w-4" /> Reset pencarian</button>}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
