import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { BadgeCheck, Printer, ShieldX, SearchX } from "lucide-react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { SkDocument, SkScaler, useSkQr } from "@/components/sk/SkDocument";
import { getSk } from "@/lib/cms.functions";
import { rowToSk } from "@/lib/sk";
import { formatTanggal } from "@/lib/armi";

const skQuery = (kode: string) => queryOptions({ queryKey: ["sk-verifikasi", kode], queryFn: () => getSk({ data: { kode } }) });

export const Route = createFileRoute("/verifikasi-sk/$kode")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(skQuery(params.kode)),
  head: ({ loaderData: sk }) => {
    const title = sk ? `Verifikasi SK ${sk.nomor} — ARMI DPD Jawa Barat` : "SK tidak ditemukan — ARMI DPD Jawa Barat";
    const desc = sk ? `Surat Keputusan resmi DPD ARMI Jawa Barat untuk ${sk.nama_penerima} sebagai ${sk.jabatan}.` : "Nomor atau kode SK tidak terdaftar di sistem DPD ARMI Jawa Barat.";
    return { meta: [
      { title }, { name: "description", content: desc }, { name: "robots", content: "noindex" },
      { property: "og:title", content: title }, { property: "og:description", content: desc },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    ] };
  },
  component: Page,
});

function Page() {
  const { kode } = Route.useParams();
  const { data } = useSuspenseQuery(skQuery(kode));
  const sk = data ? rowToSk(data) : null;
  const qr = useSkQr(sk?.kode);

  if (!sk) return (
    <PublicLayout>
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <SearchX className="mx-auto h-14 w-14 text-destructive" />
        <h1 className="mt-4 text-3xl font-black uppercase md:text-4xl">SK Tidak Terdaftar</h1>
        <p className="mt-3 text-muted-foreground">Kode atau nomor <b className="text-foreground">{kode}</b> tidak ditemukan di sistem DPD ARMI Jawa Barat. Dokumen ini kemungkinan bukan SK resmi.</p>
        <Link to="/verifikasi-sk" className="mt-8 inline-block rounded-lg bg-primary px-5 py-3 text-sm font-bold uppercase text-primary-foreground">Cek Nomor SK Lain</Link>
      </div>
    </PublicLayout>
  );

  const valid = sk.status === "aktif";
  return (
    <PublicLayout>
      <section className="mx-auto max-w-5xl px-5 py-12">
        <div className={`flex flex-wrap items-center gap-5 rounded-xl border p-6 ${valid ? "border-success/50 bg-success/10" : "border-destructive/50 bg-destructive/10"}`}>
          {valid ? <BadgeCheck className="h-14 w-14 shrink-0 text-success" /> : <ShieldX className="h-14 w-14 shrink-0 text-destructive" />}
          <div className="min-w-0 flex-1">
            <div className={`text-xs font-bold uppercase tracking-widest ${valid ? "text-success" : "text-destructive"}`}>{valid ? "Terverifikasi asli" : "SK sudah dicabut"}</div>
            <h1 className="mt-1 text-2xl font-black uppercase md:text-3xl">{valid ? "SK Resmi DPD ARMI Jawa Barat" : "SK Ini Tidak Berlaku Lagi"}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {valid ? "Surat Keputusan ini tercatat resmi di sistem DPD ARMI Jawa Barat. Isi di bawah adalah salinan asli yang tersimpan."
                : "SK ini pernah diterbitkan DPD ARMI Jawa Barat namun telah dicabut dan tidak berlaku."}
            </p>
          </div>
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-bold hover:border-primary">
            <Printer className="h-4 w-4" /> Cetak / PDF
          </button>
        </div>
        <dl className="mt-4 grid gap-3 rounded-xl border border-border bg-card p-5 text-sm sm:grid-cols-2 lg:grid-cols-4">
          {[["Nomor SK", sk.nomor], ["Nama", sk.nama_penerima], ["Jabatan", sk.jabatan], ["Tanggal Ditetapkan", formatTanggal(sk.tanggal_ditetapkan)]].map(([k, v]) => (
            <div key={k}><dt className="text-xs uppercase tracking-wider text-muted-foreground">{k}</dt><dd className="mt-0.5 font-semibold break-words">{v}</dd></div>
          ))}
        </dl>
        <div className="mx-auto mt-8 max-w-[210mm]">
          <SkScaler><SkDocument sk={sk} qr={qr} /></SkScaler>
        </div>
      </section>
    </PublicLayout>
  );
}
