import { createFileRoute } from "@tanstack/react-router";
import { Target, Flag } from "lucide-react";
import { PublicLayout, PageHeading } from "@/components/site/PublicLayout";
import { ProgramCards } from "@/components/site/shared";

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
  "Mempererat kebersamaan antar pengusaha rental di 27 kabupaten/kota Jawa Barat.",
  "Meningkatkan profesionalitas dan legalitas usaha rental mobil.",
  "Membangun kemitraan strategis dengan pemerintah, aparat, dan industri.",
];

function Page() {
  return (
    <PublicLayout>
      <section className="mx-auto max-w-7xl px-4 py-16">
        <PageHeading eyebrow="Tentang Kami" title="ARMI DPD Jawa Barat"
          desc="ARMI (Anggota Rental Mobil Indonesia) DPD Jawa Barat adalah wadah resmi para pengusaha rental mobil di Jawa Barat. Berlandaskan semangat Tri Arutala — Kebersamaan, Keamanan, Professionalitas — kami hadir untuk melindungi dan memajukan usaha anggota." />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-6">
            <Target className="mb-3 h-8 w-8 text-primary" />
            <h2 className="text-2xl font-extrabold uppercase">Visi</h2>
            <p className="mt-2 text-muted-foreground">Menjadi organisasi rental mobil paling solid, aman, dan profesional di Indonesia.</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <Flag className="mb-3 h-8 w-8 text-primary" />
            <h2 className="text-2xl font-extrabold uppercase">Misi</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
              {MISI.map((m) => <li key={m}>{m}</li>)}
            </ul>
          </div>
        </div>
        <h2 className="mb-6 mt-16 text-4xl font-black uppercase">Program <span className="text-primary">Utama</span></h2>
        <ProgramCards />
      </section>
    </PublicLayout>
  );
}
