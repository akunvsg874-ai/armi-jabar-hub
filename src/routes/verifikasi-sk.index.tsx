import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { QrCode, Search } from "lucide-react";
import { PublicLayout } from "@/components/site/PublicLayout";

export const Route = createFileRoute("/verifikasi-sk/")({
  head: () => ({ meta: [
    { title: "Verifikasi SK Anggota — ARMI DPD Jawa Barat" },
    { name: "description", content: "Cek keaslian Surat Keputusan DPD ARMI Jawa Barat dengan memindai QR Code atau memasukkan nomor SK." },
    { property: "og:title", content: "Verifikasi SK Anggota — ARMI DPD Jawa Barat" },
    { property: "og:description", content: "Cek keaslian Surat Keputusan DPD ARMI Jawa Barat lewat QR Code atau nomor SK." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Page,
});

function Page() {
  const [v, setV] = useState("");
  const navigate = useNavigate();
  return (
    <PublicLayout>
      <section className="mx-auto max-w-2xl px-5 py-24 text-center">
        <QrCode className="mx-auto h-14 w-14 text-primary" />
        <h1 className="mt-4 text-4xl font-black uppercase md:text-5xl">Verifikasi SK</h1>
        <p className="mt-3 text-muted-foreground">Pindai QR Code pada SK, atau masukkan nomor SK untuk memastikan dokumen tersebut asli diterbitkan DPD ARMI Jawa Barat.</p>
        <form className="mt-8 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (v.trim()) navigate({ to: "/verifikasi-sk/$kode", params: { kode: v.trim() } }); }}>
          <input value={v} onChange={(e) => setV(e.target.value)} maxLength={120} placeholder="Contoh: 41736/XVII/ARMI-DPD/X/2026"
            className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
          <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold uppercase text-primary-foreground"><Search className="h-4 w-4" /> Cek</button>
        </form>
      </section>
    </PublicLayout>
  );
}
