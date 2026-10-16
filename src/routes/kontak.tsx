import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Phone, Mail } from "lucide-react";
import { PublicLayout, PageHeading } from "@/components/site/PublicLayout";

export const Route = createFileRoute("/kontak")({
  head: () => ({
    meta: [
      { title: "Kontak & Gabung Anggota — ARMI DPD Jawa Barat" },
      { name: "description", content: "Hubungi sekretariat DPD ARMI Jawa Barat untuk pendaftaran anggota dan informasi." },
      { property: "og:title", content: "Kontak ARMI DPD Jawa Barat" },
      { property: "og:description", content: "Hubungi sekretariat untuk bergabung menjadi anggota." },
    ],
  }),
  component: Page,
});

function Page() {
  const items = [
    { icon: MapPin, label: "Sekretariat", value: "Jl. Contoh No. 1, Kota Bandung, Jawa Barat" },
    { icon: Phone, label: "Telepon / WhatsApp", value: "0812-0000-0000" },
    { icon: Mail, label: "Email", value: "sekretariat@armijabar.id" },
  ];
  return (
    <PublicLayout>
      <section className="mx-auto max-w-5xl px-4 py-16">
        <PageHeading eyebrow="Kontak" title="Gabung Bersama ARMI Jabar"
          desc="Pendaftaran anggota dilakukan melalui sekretariat DPD. Setelah diverifikasi, admin akan membuatkan nomor anggota dan password untuk masuk ke portal." />
        <div className="grid gap-4 md:grid-cols-3">
          {items.map((i) => (
            <div key={i.label} className="rounded-xl border border-border bg-card p-6">
              <i.icon className="mb-3 h-6 w-6 text-primary" />
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{i.label}</div>
              <div className="mt-1 font-semibold">{i.value}</div>
            </div>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
