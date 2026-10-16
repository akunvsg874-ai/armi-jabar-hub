import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Search, Building2, MapPin } from "lucide-react";
import { PublicLayout, PageHeading } from "@/components/site/PublicLayout";
import { StatusBadge, EmptyState } from "@/components/site/shared";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/anggota")({
  head: () => ({
    meta: [
      { title: "Cari Anggota — ARMI DPD Jawa Barat" },
      { name: "description", content: "Verifikasi rental mobil resmi anggota ARMI Jawa Barat berdasarkan nama, usaha, atau wilayah." },
      { property: "og:title", content: "Cari Anggota ARMI Jabar" },
      { property: "og:description", content: "Verifikasi rental mobil resmi anggota ARMI Jawa Barat." },
    ],
  }),
  component: Page,
});

function Page() {
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  useEffect(() => { const t = setTimeout(() => setDebounced(q), 300); return () => clearTimeout(t); }, [q]);
  const { data, isLoading } = useQuery({
    queryKey: ["cari-anggota", debounced],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("cari_anggota_publik", { q: debounced });
      if (error) throw error;
      return data;
    },
  });
  return (
    <PublicLayout>
      <section className="mx-auto max-w-7xl px-4 py-16">
        <PageHeading eyebrow="Verifikasi" title="Cari Anggota" desc="Pastikan rental mobil Anda adalah anggota resmi ARMI Jawa Barat." />
        <div className="relative mb-8 max-w-xl">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama, nama usaha, atau wilayah…"
            className="w-full rounded-lg border border-input bg-card py-3 pl-12 pr-4 outline-none focus:border-primary" />
        </div>
        {isLoading ? <p className="text-muted-foreground">Mencari…</p> : data && data.length ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.map((a) => (
              <div key={a.nomor_anggota} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-xl font-extrabold uppercase">{a.nama_lengkap}</h3>
                  <StatusBadge status={a.status} />
                </div>
                <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><Building2 className="h-4 w-4 text-primary" />{a.nama_usaha}</p>
                <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4 text-primary" />{a.wilayah}</p>
              </div>
            ))}
          </div>
        ) : <EmptyState text="Tidak ada anggota ditemukan" />}
      </section>
    </PublicLayout>
  );
}
