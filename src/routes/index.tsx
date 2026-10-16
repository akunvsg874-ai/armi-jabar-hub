import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, MapPinned, Users, ShieldCheck, Headset, HeartHandshake, Shield, BadgeCheck } from "lucide-react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { KegiatanCard, ProgramCards, EmptyState } from "@/components/site/shared";
import { kegiatanQuery } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import heroImg from "@/assets/hero-cars.jpg";
import convoyImg from "@/assets/convoy.jpg";
import communityImg from "@/assets/community.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ARMI DPD Jawa Barat — Wadah Resmi Rental Mobil Jabar" },
      { name: "description", content: "Membangun sinergi & profesionalitas pengusaha rental mobil di Jawa Barat." },
      { property: "og:title", content: "ARMI DPD Jawa Barat" },
      { property: "og:description", content: "Wadah resmi pengusaha rental mobil Jawa Barat." },
    ],
  }),
  component: Index,
});

function Index() {
  const { data: kegiatan, isLoading } = useQuery(kegiatanQuery);
  const { data: stat } = useQuery({
    queryKey: ["statistik"],
    queryFn: async () => (await supabase.rpc("statistik_publik")).data as { anggota: number } | null,
  });

  const STATS = [
    { icon: MapPinned, v: "27", l: "Kabupaten/Kota", d: "Cakupan wilayah Jawa Barat" },
    { icon: Users, v: stat ? String(stat.anggota) : "—", l: "Anggota Aktif", d: "Terdaftar di portal ARMI" },
    { icon: ShieldCheck, v: "Terverifikasi", l: "Direktori Anggota", d: "Cek rental resmi secara terbuka" },
    { icon: Headset, v: "Korlap", l: "Jaringan Bantuan", d: "Koordinasi antar wilayah" },
  ];

  return (
    <PublicLayout overlay>
      {/* HERO */}
      <section className="relative flex min-h-[640px] items-end overflow-hidden md:min-h-[760px] md:items-center">
        <img src={heroImg} alt="Deretan armada rental mobil premium di malam hari" width={1600} height={912}
          className="absolute inset-0 h-full w-full object-cover object-[70%_center]" />
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="absolute inset-0 bg-bottom-fade" />
        <div className="absolute -right-24 top-0 hidden h-full w-48 -skew-x-12 bg-primary/80 lg:block" aria-hidden />
        <div className="relative mx-auto w-full max-w-7xl px-5 pb-16 pt-28 md:py-0">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Wadah Resmi Pengusaha Rental Mobil Jawa Barat
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-[68px]">
              Membangun Sinergi & <span className="text-primary">Profesionalitas</span> Rental Mobil Jawa Barat
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-[17px]">
              ARMI DPD Jawa Barat menjadi wadah kolaborasi pengusaha rental mobil untuk memperkuat jaringan, meningkatkan profesionalitas, dan membangun ekosistem usaha yang lebih aman dan terpercaya.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/kontak" className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark">
                Daftar Anggota DPD <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/anggota" className="inline-flex items-center gap-2 rounded-md border border-input bg-background/40 px-6 py-3 text-sm font-semibold backdrop-blur transition-colors hover:border-foreground">
                Cari Anggota
              </Link>
            </div>
            <p className="mt-8 text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
              Kebersamaan <span className="text-primary">•</span> Keamanan <span className="text-primary">•</span> Profesionalitas
            </p>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <div key={s.l} className={`flex items-start gap-4 px-5 py-8 ${i % 2 ? "border-l" : ""} ${i >= 2 ? "border-t lg:border-t-0" : ""} ${i === 2 ? "lg:border-l" : ""} border-border`}>
              <s.icon className="mt-1 h-5 w-5 shrink-0 text-primary" />
              <div>
                <div className="text-2xl font-extrabold tracking-tight md:text-3xl">{s.v}</div>
                <div className="mt-1 text-sm font-semibold">{s.l}</div>
                <div className="text-xs text-muted-foreground">{s.d}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PROGRAM — light editorial */}
      <section className="bg-ivory py-20 text-ink md:py-28">
        <div className="mx-auto max-w-7xl px-5">
          <div className="mb-12 grid gap-4 md:grid-cols-2 md:items-end">
            <h2 className="accent-bar text-3xl font-extrabold tracking-tight md:text-[42px] md:leading-tight">Lebih dari Sekadar Komunitas</h2>
            <p className="text-base text-ink-muted md:text-right">Kolaborasi untuk membangun ekosistem usaha rental mobil yang lebih kuat.</p>
          </div>
          <ProgramCards light />
        </div>
      </section>

      {/* KEGIATAN */}
      <section className="mx-auto max-w-7xl px-5 py-20 md:py-28">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="accent-bar text-3xl font-extrabold tracking-tight md:text-[42px] md:leading-tight">Informasi Kegiatan DPD ARMI Jabar</h2>
            <p className="mt-3 text-muted-foreground">Dokumentasi kegiatan, pertemuan, dan kolaborasi anggota ARMI Jawa Barat.</p>
          </div>
          <Link to="/info-kegiatan" className="inline-flex items-center gap-2 rounded-md border border-input px-5 py-2.5 text-sm font-semibold hover:border-foreground">
            Lihat Semua Kegiatan <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => <div key={i} className="h-96 animate-pulse rounded-lg bg-card" />)}
          </div>
        ) : kegiatan && kegiatan.length ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {kegiatan.slice(0, 6).map((k) => <KegiatanCard key={k.id} k={k} />)}
          </div>
        ) : (
          <EmptyState text="Belum ada kegiatan yang dipublikasikan." />
        )}
      </section>

      {/* VALUES */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 md:py-28 lg:grid-cols-2 lg:items-center">
          <div className="grid grid-cols-5 grid-rows-2 gap-3">
            <img src={convoyImg} alt="Konvoi armada di jalan pegunungan Jawa Barat" loading="lazy" width={1408} height={1008} className="col-span-3 row-span-2 h-full w-full rounded-lg object-cover" />
            <img src={communityImg} alt="Suasana silaturahmi komunitas rental mobil" loading="lazy" width={1408} height={1008} className="col-span-2 h-full w-full rounded-lg object-cover" />
            <img src={heroImg} alt="Armada rental mobil" loading="lazy" width={1600} height={912} className="col-span-2 h-full w-full rounded-lg object-cover" />
          </div>
          <div>
            <h2 className="accent-bar text-3xl font-extrabold tracking-tight md:text-[42px] md:leading-tight">Satu Tujuan, Satu Komunitas</h2>
            <p className="mt-4 text-muted-foreground">Tri Arutala menjadi pegangan setiap anggota ARMI Jawa Barat dalam menjalankan usaha dan berorganisasi.</p>
            <div className="mt-8 space-y-6">
              {[
                { icon: HeartHandshake, t: "Kebersamaan", d: "Saling mendukung antar pengusaha rental lintas kabupaten dan kota." },
                { icon: Shield, t: "Keamanan", d: "Berbagi informasi untuk melindungi armada dari konsumen bermasalah." },
                { icon: BadgeCheck, t: "Profesionalitas", d: "Menjaga standar layanan dan kepercayaan masyarakat." },
              ].map((v) => (
                <div key={v.t} className="flex gap-4 border-l-2 border-primary pl-5">
                  <v.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <h3 className="text-lg font-bold">{v.t}</h3>
                    <p className="text-sm text-muted-foreground">{v.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT — light */}
      <section className="bg-ivory text-ink">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 md:py-28 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="accent-bar text-3xl font-extrabold tracking-tight md:text-[42px] md:leading-tight">Mengenal ARMI DPD Jawa Barat</h2>
            <p className="mt-5 text-base leading-relaxed text-ink-muted">
              ARMI (Anggota Rental Mobil Indonesia) DPD Jawa Barat adalah wadah para pengusaha rental mobil di Jawa Barat. Kami menghubungkan anggota untuk memperkuat jaringan, menjaga keamanan armada, dan meningkatkan profesionalitas usaha.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-ink">
              <li className="flex gap-2"><span className="text-primary">—</span> Keamanan & Pandawa Korlap</li>
              <li className="flex gap-2"><span className="text-primary">—</span> Jaringan & Sub-Driver</li>
              <li className="flex gap-2"><span className="text-primary">—</span> Legalitas & Kemitraan</li>
            </ul>
            <Link to="/tentang" className="mt-8 inline-flex items-center gap-2 rounded-md bg-ink px-6 py-3 text-sm font-semibold text-ivory hover:bg-primary">
              Selengkapnya <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <img src={communityImg} alt="Anggota komunitas rental mobil berbincang" loading="lazy" width={1408} height={1008} className="aspect-[4/3] w-full rounded-lg object-cover" />
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <img src={convoyImg} alt="" loading="lazy" width={1408} height={1008} className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="relative mx-auto max-w-7xl px-5 py-20 md:py-28">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-extrabold tracking-tight md:text-[44px] md:leading-tight">Jadi Bagian dari Ekosistem Rental Mobil yang Lebih Kuat</h2>
            <p className="mt-4 text-muted-foreground">Bersama ARMI DPD Jawa Barat, bangun jaringan, berbagi pengalaman, dan tumbuh bersama pelaku usaha rental mobil.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/kontak" className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-dark">Informasi Keanggotaan</Link>
              <Link to="/kontak" className="rounded-md border border-input px-6 py-3 text-sm font-semibold hover:border-foreground">Hubungi Pengurus</Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
