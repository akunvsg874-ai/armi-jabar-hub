import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheck, UserPlus } from "lucide-react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { KegiatanCard, ProgramCards, EmptyState } from "@/components/site/shared";
import { kegiatanQuery } from "@/lib/queries";
import { LOGO_URL } from "@/lib/armi";
import heroImg from "@/assets/hero-cars.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ARMI DPD Jawa Barat — Wadah Resmi Rental Mobil Jabar" },
      { name: "description", content: "Membangun sinergi & professionalitas pengusaha rental mobil di 27 kabupaten/kota Jawa Barat." },
      { property: "og:title", content: "ARMI DPD Jawa Barat" },
      { property: "og:description", content: "Wadah resmi pengusaha rental mobil Jawa Barat." },
    ],
  }),
  component: Index,
});

const STATS = [
  { v: "27", l: "Kabupaten/Kota" },
  { v: "500+", l: "Anggota Terdaftar" },
  { v: "2.500+", l: "Armada Terverifikasi" },
  { v: "24/7", l: "Jaringan Bantuan Korlap" },
];

function Index() {
  const { data: kegiatan, isLoading } = useQuery(kegiatanQuery);
  return (
    <PublicLayout>
      <section className="relative overflow-hidden">
        <img src={heroImg} alt="Armada rental mobil" width={1600} height={912} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 md:py-28 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <span className="skew-tag inline-block bg-primary px-4 py-1 text-xs font-bold uppercase tracking-widest text-primary-foreground">
              Wadah Resmi Pengusaha Rental Mobil Jawa Barat
            </span>
            <h1 className="mt-6 text-5xl font-black uppercase italic leading-[0.95] md:text-7xl">
              Membangun Sinergi & <span className="text-primary">Professionalitas</span> Rental Mobil Jawa Barat
            </h1>
            <p className="mt-6 max-w-xl text-base text-muted-foreground md:text-lg">
              DPD ARMI Jawa Barat menyatukan pengusaha rental mobil untuk saling menjaga keamanan armada, memperluas jaringan, dan meningkatkan standar layanan.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/kontak" className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-bold text-primary-foreground shadow-glow hover:bg-primary-dark">
                <UserPlus className="h-5 w-5" /> Daftar Anggota DPD
              </Link>
              <Link to="/anggota" className="inline-flex items-center gap-2 rounded-lg border border-input bg-background/40 px-6 py-3 font-bold backdrop-blur hover:border-primary">
                <ShieldCheck className="h-5 w-5" /> Verifikasi Rental Resmi
              </Link>
            </div>
          </div>
          <div className="hidden justify-center lg:flex">
            <div className="rotate-2 rounded-2xl border border-border bg-card/80 p-6 shadow-glow backdrop-blur">
              <img src={LOGO_URL} alt="Logo ARMI" width={300} height={300} className="h-64 w-64 rounded-xl" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-border px-4 md:grid-cols-4 md:divide-x">
          {STATS.map((s) => (
            <div key={s.l} className="px-4 py-8 text-center">
              <div className="font-display text-5xl font-black italic text-primary">{s.v}</div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="mb-10 flex items-end justify-between gap-4">
          <h2 className="text-4xl font-black uppercase md:text-5xl">
            Informasi Kegiatan <span className="text-primary">DPD ARMI Jabar</span>
          </h2>
        </div>
        {isLoading ? (
          <p className="text-muted-foreground">Memuat kegiatan…</p>
        ) : kegiatan && kegiatan.length ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {kegiatan.map((k) => <KegiatanCard key={k.id} k={k} />)}
          </div>
        ) : (
          <EmptyState text="Belum ada kegiatan" />
        )}
      </section>

      <section className="bg-card/50 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="mb-10 text-4xl font-black uppercase md:text-5xl">Program <span className="text-primary">Utama</span></h2>
          <ProgramCards />
        </div>
      </section>
    </PublicLayout>
  );
}
