import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { KegiatanDetail } from "@/components/site/KegiatanDetail";
import { Lightbox } from "@/components/site/Lightbox";
import type { Kegiatan } from "@/components/site/shared";
import { ArrowRight, MapPin, Search, Shield, Network, Scale, Users } from "lucide-react";
import { PublicLayout, logoArmi, logoDpd } from "@/components/site/PublicLayout";
import { JenisBadge, StatusBadge } from "@/components/site/shared";
import { kegiatanQuery } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { WILAYAH_JABAR, todayISO } from "@/lib/armi";
import { halamanQuery, seoMeta, galeriQuery, artikelListQuery } from "@/lib/cms";
import { useSuspenseQuery } from "@tanstack/react-query";
import heroImg from "@/assets/hero-cars.jpg";
import convoyImg from "@/assets/convoy.jpg";
import communityImg from "@/assets/community.jpg";

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(halamanQuery("beranda")),
  head: ({ loaderData }) => seoMeta(loaderData, "beranda"),
  component: Index,
});

const BULAN = ["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGU", "SEP", "OKT", "NOV", "DES"];

function Label({ children, light, n }: { children: string; light?: boolean; n?: string }) {
  return (
    <span className={`flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] ${light ? "text-ink" : "text-foreground/80"}`}>
      {n && <span className="text-primary">{n} /</span>}{children}
    </span>
  );
}

const H2 = "mt-3 text-4xl font-black uppercase leading-[0.95] tracking-wide md:text-[52px]";
const btnP = "inline-flex items-center gap-2 rounded-md bg-primary px-8 py-4 text-sm font-bold uppercase tracking-[0.25em] text-primary-foreground shadow-glow transition-colors hover:bg-primary-dark";
const btnS = "inline-flex items-center gap-2 rounded-md border border-border bg-card px-8 py-4 text-sm font-bold uppercase tracking-[0.25em] transition-colors hover:border-primary";

/** Hero background: wide photos fill the area; small/square images (e.g. logos) become an elegant centered emblem. */
function HeroBg({ src }: { src: string }) {
  const [emblem, setEmblem] = useState<boolean | null>(null);
  useEffect(() => {
    const i = new Image();
    i.onload = () => setEmblem(i.naturalWidth < 1200 || i.naturalWidth / i.naturalHeight < 1.3);
    i.src = src;
  }, [src]);
  return (
    <div aria-hidden className="absolute inset-0">
      {emblem ? (
        <>
          <img src={src} alt="" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-20 blur-3xl" />
          <img src={src} alt="" className="absolute left-1/2 top-1/2 h-[70%] max-h-[560px] w-auto -translate-x-1/2 -translate-y-1/2 object-contain opacity-[0.12]" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background" />
        </>
      ) : (
        <>
          <img src={src} alt=""
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${emblem === false ? "opacity-100" : "opacity-0"}`} />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/65 to-background" />
        </>
      )}
    </div>
  );
}

function Index() {
  const { data: h } = useSuspenseQuery(halamanQuery("beranda"));
  const { data: kegiatan = [] } = useQuery(kegiatanQuery);
  const { data: anggota = [] } = useQuery({
    queryKey: ["cari-anggota", ""],
    queryFn: async () => (await supabase.rpc("cari_anggota_publik", { q: "" })).data ?? [],
  });

  const upcoming = kegiatan.filter((k) => k.tanggal >= todayISO()).sort((a, b) => a.tanggal.localeCompare(b.tanggal)).slice(0, 3);
  const perWilayah = useMemo(() => {
    const m = new Map<string, number>();
    anggota.filter((a) => a.status === "aktif").forEach((a) => m.set(a.wilayah, (m.get(a.wilayah) ?? 0) + 1));
    return m;
  }, [anggota]);
  const preview = anggota.filter((a) => a.status === "aktif").slice(0, 4);

  const { data: galeri = [] } = useQuery(galeriQuery);
  const { data: artikel = [] } = useQuery(artikelListQuery);
  const [view, setView] = useState<Kegiatan | null>(null);
  const [lb, setLb] = useState<number | null>(null);
  const gallery = galeri.length
    ? galeri.slice(0, 5).map((g) => ({ src: g.gambar, label: g.judul || "Dokumentasi", w: 1200, h: 900 }))
    : [
        { src: convoyImg, label: "Konvoi", w: 1408, h: 1008 },
        { src: communityImg, label: "Kopdar", w: 1408, h: 1008 },
        { src: heroImg, label: "Armada", w: 1600, h: 912 },
      ];
  const terbaru = upcoming.length ? upcoming : [...kegiatan].slice(0, 3);

  return (
    <PublicLayout overlay>
      {/* HERO */}
      <section className="relative overflow-hidden">
        {h.hero_image && (<>
          <HeroBg src={h.hero_image} />
        </>)}
        <div aria-hidden className="absolute inset-0 bg-radial-glow" />
        <img src={logoArmi.url} alt="" aria-hidden width={431} height={461} className="pointer-events-none absolute left-1/2 top-24 w-[720px] max-w-[95vw] -translate-x-1/2 opacity-[0.05] grayscale" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 z-[1] mx-auto hidden max-w-[1400px] -translate-y-1/2 items-center justify-between px-10 xl:flex 2xl:px-16">
          <img src={logoArmi.url} alt="" width={431} height={461} className="h-44 w-auto drop-shadow-[0_10px_30px_rgba(0,0,0,0.6)] 2xl:h-52" />
          <img src={logoDpd.url} alt="" className="h-44 w-auto drop-shadow-[0_10px_30px_rgba(0,0,0,0.6)] 2xl:h-52" />
        </div>
        <div className="mb-0 flex items-center justify-center gap-6 pt-28 xl:hidden">
          <img src={logoArmi.url} alt="Logo ARMI" className="relative h-16 w-auto md:h-20" />
          <span className="relative h-10 w-px bg-border" />
          <img src={logoDpd.url} alt="Logo DPD ARMI Jawa Barat" className="relative h-16 w-auto md:h-20" />
        </div>
        <div className="relative mx-auto max-w-5xl px-5 pb-20 pt-8 xl:pt-36 text-center md:pb-28 md:pt-10 xl:pt-44">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-foreground/80">
            <Shield className="h-3.5 w-3.5 text-primary" /> {h.hero_eyebrow}
          </span>
          <h1 className="mt-8 text-5xl font-black uppercase leading-[1] sm:text-6xl lg:text-[84px]">
            {h.hero_title ? h.hero_title : <>Satu Jaringan. <span className="text-primary">Satu Semangat.</span><br />Tumbuh <span className="text-muted-foreground">Bersama.</span></>}
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {h.hero_desc}
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/login" className={btnP}>Masuk Portal</Link>
            <Link to="/anggota" className={btnS}>Cari Anggota</Link>
          </div>
        </div>
        <div className="relative border-y border-border bg-card/60 backdrop-blur">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-5 py-10 md:grid-cols-4">
            {[
              [MapPin, "27", "Kabupaten / Kota"],
              [Users, String(anggota.filter((a) => a.status === "aktif").length), "Anggota Aktif"],
              [Network, String(kegiatan.length), "Kegiatan Tercatat"],
              [Shield, "3", "Nilai Tri Arutala"],
            ].map(([Icon, v, l]) => {
              const I = Icon as typeof Users;
              return (
                <div key={l as string} className="text-center">
                  <I className="mx-auto h-5 w-5 text-primary" />
                  <div className="mt-3 font-display text-4xl font-black leading-none">{v as string}</div>
                  <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{l as string}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* INTRO — light */}
      <section className="border-y border-border bg-ivory text-ink">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 md:py-28 lg:grid-cols-2 lg:items-center">
          <div>
            <Label light n="01">Tentang Komunitas</Label>
            <h2 className={H2}>Bukan Sekadar<br /><span className="text-primary">Jaringan Usaha.</span></h2>
            <p className="mt-4 -rotate-3 font-script text-2xl">Jawa Barat lebih kuat bersama</p>
            <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-ink-muted">
              ARMI DPD Jawa Barat mempertemukan pengusaha rental mobil dalam jaringan yang mengutamakan kebersamaan, keamanan, dan profesionalitas.
            </p>
            <Link to="/tentang" className="mt-8 inline-flex items-center gap-2 rounded-sm bg-ink px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-ivory hover:bg-primary">
              Mengenal ARMI <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative">
            <img src={communityImg} alt="Suasana silaturahmi anggota komunitas rental mobil" loading="lazy" width={1408} height={1008} className="aspect-[4/3] w-full object-cover [clip-path:polygon(0_0,100%_0,100%_88%,88%_100%,0_100%)]" />
            <img src={logoArmi.url} alt="Logo ARMI" loading="lazy" width={431} height={461} className="absolute -bottom-8 -left-4 h-28 w-auto drop-shadow-xl md:-left-8 md:h-36" />
          </div>
        </div>
      </section>

      {/* PROGRAMS */}
      <section className="mx-auto max-w-7xl px-5 py-20 md:py-28">
        <Label n="02">Apa yang Kami Bangun</Label>
        <h2 className={H2}><span className="bar-mark" />Bertumbuh Lebih Kuat, <span className="text-primary">Bersama.</span></h2>
        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          <div className="relative overflow-hidden rounded-md border border-border bg-card p-8">
            <div aria-hidden className="absolute -right-10 -top-10 h-40 w-40 rounded-full border-[14px] border-primary/15" />
            <div aria-hidden className="absolute -right-2 -top-2 h-24 w-24 rounded-full border-4 border-primary/25" />
            <Shield className="h-8 w-8 text-primary" />
            <h3 className="mt-16 text-2xl font-bold uppercase leading-tight">Keamanan & Pandawa Korlap</h3>
            <p className="mt-3 text-[15px] text-muted-foreground">Mendorong koordinasi dan kerja sama antaranggota untuk mendukung keamanan serta respons komunitas sesuai mekanisme organisasi.</p>
          </div>
          <div className="group relative min-h-[360px] overflow-hidden rounded-md">
            <img src={heroImg} alt="Armada anggota" loading="lazy" width={1600} height={912} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-bottom-fade" />
            <div className="absolute inset-0 bg-background/40" />
            <div className="relative flex h-full flex-col justify-end p-8">
              <Network className="h-8 w-8 text-primary" />
              <h3 className="mt-4 text-2xl font-bold uppercase leading-tight">Jaringan & Sub-Driver</h3>
              <p className="mt-3 text-[15px] text-foreground/80">Memperkuat koneksi antaranggota dan mendukung kolaborasi operasional dalam ekosistem usaha rental mobil.</p>
            </div>
          </div>
          <div className="rounded-md border-t-4 border-armi-green bg-ivory p-8 text-ink">
            <Scale className="h-8 w-8 text-armi-green" />
            <h3 className="mt-16 text-2xl font-bold uppercase leading-tight">Legalitas & Kemitraan</h3>
            <p className="mt-3 text-[15px] text-ink-muted">Mendorong profesionalitas usaha dan membuka ruang kolaborasi dengan mitra yang relevan.</p>
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="border-t border-border bg-card py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-5">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <Label n="03">Cerita Kebersamaan</Label>
              <h2 className={`${H2} bar-mark`}>Galeri Kegiatan</h2>
              <p className="mt-2 -rotate-2 font-script text-2xl text-primary">Lebih dari sekadar komunitas</p>
              <p className="mt-4 text-muted-foreground">Dokumentasi kegiatan, pertemuan, dan momen kebersamaan anggota ARMI Jawa Barat.</p>
            </div>
            <Link to="/galeri" className={btnS}>Lihat Semua Galeri</Link>
          </div>
          <div className="mt-12 grid gap-3 md:grid-cols-3 md:grid-rows-2">
            {gallery.map((g, i) => (
              <figure key={i} onClick={() => setLb(i)} className={`group relative cursor-pointer overflow-hidden rounded-sm ${i === 0 ? "md:col-span-2 md:row-span-2" : ""}`}>
                <img src={g.src} alt={`Dokumentasi ${g.label.toLowerCase()}`} loading="lazy" width={g.w} height={g.h} className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${i === 0 ? "aspect-[4/3] md:h-full md:aspect-auto" : "aspect-[4/3]"}`} />
                <figcaption className="absolute left-3 top-3 rounded-sm bg-background/80 px-2 py-1 text-[10px] font-bold uppercase tracking-widest">{g.label}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* AGENDA */}
      <section className="mx-auto max-w-7xl px-5 py-20 md:py-28">
        <Label n="04">Agenda Komunitas</Label>
        <h2 className={`${H2} bar-mark`}>Kegiatan Terbaru</h2>
        <div className="mt-12 divide-y divide-border border-y border-border">
          {terbaru.length ? terbaru.map((k) => {
            const d = new Date(k.tanggal + "T00:00:00");
            return (
              <div key={k.id} onClick={() => setView(k)} className="grid cursor-pointer gap-4 py-7 transition-colors hover:bg-card/60 md:grid-cols-[120px_1fr_auto] md:items-center">
                <div className="flex items-baseline gap-2 md:block">
                  <div className="text-5xl font-extrabold leading-none tracking-tight">{String(d.getDate()).padStart(2, "0")}</div>
                  <div className="text-sm font-bold tracking-widest text-primary">{BULAN[d.getMonth()]} {d.getFullYear()}</div>
                </div>
                <div>
                  <JenisBadge jenis={k.jenis} />
                  <h3 className="mt-2 text-xl font-bold hover:text-primary">{k.judul}</h3>
                  <p className="mt-1 line-clamp-2 max-w-2xl text-sm text-muted-foreground">{k.deskripsi}</p>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin className="h-4 w-4 text-primary" />{k.lokasi}</div>
              </div>
            );
          }) : (
            <div className="py-12 text-center text-muted-foreground">
              Belum ada agenda mendatang. <Link to="/agenda" className="text-primary">Lihat arsip kegiatan →</Link>
            </div>
          )}
        </div>
      </section>

      {/* ARTIKEL */}
      {artikel.length > 0 && (
        <section className="border-t border-border bg-card py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-5">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div><Label n="05">Kabar & Wawasan</Label><h2 className={`${H2} bar-mark`}>Artikel Terbaru</h2></div>
              <Link to="/artikel" className={btnS}>Semua Artikel</Link>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {artikel.slice(0, 3).map((a) => (
                <Link key={a.id} to="/artikel/$slug" params={{ slug: a.slug }} className="group overflow-hidden rounded-lg border border-border bg-background transition-colors hover:border-primary">
                  {a.gambar && <img src={a.gambar} alt={a.judul} loading="lazy" className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105" />}
                  <div className="p-5">
                    <h3 className="text-lg font-bold leading-snug group-hover:text-primary">{a.judul}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{a.ringkasan}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* REGIONAL + DIRECTORY */}
      <section className="border-y border-border bg-ivory text-ink">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 md:py-28 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <Label light n="06">Jaringan Kita</Label>
            <h2 className={H2}>Di Seluruh<br /><span className="text-primary">Jawa Barat</span></h2>
            <p className="mt-3 -rotate-2 font-script text-2xl">27 kabupaten/kota, satu tujuan</p>
            <p className="mt-5 max-w-md text-ink-muted">Temukan anggota ARMI berdasarkan wilayah dan kenali jaringan usaha rental mobil di Jawa Barat.</p>
            <Link to="/anggota" className="mt-8 inline-flex items-center gap-2 rounded-sm bg-primary px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary-dark">
              <Search className="h-4 w-4" /> Cari Anggota
            </Link>
          </div>
          <div className="rounded-md border border-ink/10 p-6">
            <div className="mb-4 flex justify-between text-xs font-bold uppercase tracking-widest text-ink-muted"><span>27 Kabupaten / Kota</span><span>Anggota aktif</span></div>
            <ul className="grid gap-x-6 sm:grid-cols-2">
              {WILAYAH_JABAR.map((w) => (
                <li key={w} className="flex justify-between border-b border-ink/10 py-2 text-sm">
                  <span>{w.replace("Kabupaten ", "Kab. ")}</span>
                  <span className={perWilayah.get(w) ? "font-bold text-primary-dark" : "text-ink-muted"}>{perWilayah.get(w) ?? "–"}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 md:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <Label n="07">Jaringan Anggota</Label>
            <h2 className={H2}>Kenali Pelaku Usaha dalam Jaringan ARMI.</h2>
          </div>
          <Link to="/anggota" className={btnS}>Buka Direktori</Link>
        </div>
        {preview.length ? (
          <div className="mt-12 grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {preview.map((a) => (
              <div key={a.nomor_anggota} className="bg-background p-6">
                <StatusBadge status={a.status} />
                <h3 className="mt-4 text-lg font-bold">{a.nama_lengkap}</h3>
                <p className="text-sm text-muted-foreground">{a.nama_usaha}</p>
                <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5 text-primary" />{a.wilayah}</p>
              </div>
            ))}
          </div>
        ) : (
          <Link to="/anggota" className="mt-12 flex items-center gap-3 rounded-md border border-border bg-card p-6 text-muted-foreground hover:border-primary"><Search className="h-5 w-5" /> Cari anggota berdasarkan nama, usaha, atau wilayah</Link>
        )}
      </section>

      {/* VALUES */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-5 py-20 md:py-28">
          <h2 className="max-w-4xl text-5xl font-bold uppercase leading-[0.92] tracking-tight md:text-7xl">
            Kita Tumbuh Karena <span className="text-primary">Kebersamaan.</span>
          </h2>
          <div className="mt-14 grid gap-px bg-border md:grid-cols-3">
            {[
              ["Kebersamaan", "Membangun hubungan dan kolaborasi antaranggota."],
              ["Keamanan", "Mendukung kesadaran dan kerja sama untuk ekosistem usaha yang lebih aman."],
              ["Profesionalitas", "Mendorong praktik usaha yang bertanggung jawab dan profesional."],
            ].map(([t, d], i) => (
              <div key={t} className="bg-card p-8 md:first:pl-0">
                <div className="text-xs font-bold text-primary">0{i + 1}</div>
                <h3 className="mt-3 text-2xl font-bold uppercase">{t}</h3>
                <p className="mt-2 text-[15px] text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <img src={communityImg} alt="" loading="lazy" width={1408} height={1008} className="absolute inset-0 h-full w-full object-cover opacity-35" />
        <div className="absolute inset-0 bg-hero-overlay" />
        <div aria-hidden className="absolute inset-y-0 left-0 w-2 bg-primary" />
        <div className="relative mx-auto max-w-7xl px-5 py-24 md:py-32">
          <h2 className="max-w-3xl text-4xl font-bold uppercase leading-[0.95] tracking-tight md:text-6xl">Jadilah Bagian dari <span className="text-primary">Perjalanan Kita.</span></h2>
          <p className="mt-5 max-w-xl text-muted-foreground">Bangun jaringan, bertukar pengalaman, dan tumbuh bersama pelaku usaha rental mobil di Jawa Barat.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/gabung" className={btnP}>Gabung Menjadi Anggota</Link>
            <Link to="/kontak" className={btnS}>Hubungi Pengurus</Link>
          </div>
        </div>
      </section>
      <KegiatanDetail k={view} onOpenChange={(o) => !o && setView(null)} />
      <Lightbox items={gallery.map((g) => ({ src: g.src, alt: g.label, caption: g.label }))} open={lb !== null} onOpenChange={(o) => !o && setLb(null)} startIndex={lb ?? 0} />
    </PublicLayout>
  );
}
