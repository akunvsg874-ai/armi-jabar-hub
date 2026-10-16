import { createFileRoute, Link } from "@tanstack/react-router";
import { HeartHandshake, Shield, BadgeCheck } from "lucide-react";
import { PublicLayout, PageHero } from "@/components/site/PublicLayout";
import { ProgramCards } from "@/components/site/shared";
import convoyImg from "@/assets/convoy.jpg";
import communityImg from "@/assets/community.jpg";

export const Route = createFileRoute("/tentang")({
  head: () => ({
    meta: [
      { title: "Tentang Kami — ARMI DPD Jawa Barat" },
      { name: "description", content: "Profil, visi, dan misi DPD Anggota Rental Mobil Indonesia Jawa Barat." },
      { property: "og:title", content: "Tentang ARMI DPD Jawa Barat" },
      { property: "og:description", content: "Profil, visi, dan misi DPD ARMI Jawa Barat." },
    ],
  }),
  component: Page,
});

const MISI = [
  "Menjaga keamanan armada anggota melalui jaringan Pandawa Korlap dan data blacklist konsumen.",
  "Mempererat kebersamaan antar pengusaha rental di Jawa Barat.",
  "Meningkatkan profesionalitas dan legalitas usaha rental mobil.",
  "Membangun kemitraan strategis dengan berbagai pihak.",
];

function Page() {
  return (
    <PublicLayout>
      <PageHero image={convoyImg} eyebrow="Tentang Kami" title="Mengenal ARMI DPD Jawa Barat"
        desc="Wadah resmi para pengusaha rental mobil di Jawa Barat, berlandaskan Tri Arutala — Kebersamaan, Keamanan, Professionalitas." />

      <section className="bg-ivory text-ink">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="accent-bar text-3xl font-bold uppercase md:text-4xl">Siapa Kami</h2>
            <p className="mt-5 leading-relaxed text-ink-muted">
              ARMI (Anggota Rental Mobil Indonesia) DPD Jawa Barat menghubungkan pengusaha rental mobil untuk saling melindungi, berbagi informasi, dan tumbuh bersama sebagai pelaku usaha yang profesional.
            </p>
          </div>
          <img src={communityImg} alt="Komunitas rental mobil" loading="lazy" width={1408} height={1008} className="aspect-[4/3] w-full rounded-lg object-cover" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-8">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Visi</span>
            <p className="mt-4 text-xl font-bold leading-snug">Menjadi organisasi rental mobil yang solid, aman, dan profesional.</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-8">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Misi</span>
            <ol className="mt-4 space-y-3 text-[15px] text-muted-foreground">
              {MISI.map((m, i) => <li key={m} className="flex gap-3"><span className="font-bold text-primary">0{i + 1}</span>{m}</li>)}
            </ol>
          </div>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
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
            <Link to="/kontak" className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-dark">Informasi Keanggotaan</Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
