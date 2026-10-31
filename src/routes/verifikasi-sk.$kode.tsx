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
  const tone = valid ? "text-success" : "text-destructive";
  const details: [string, string, boolean?][] = [
    ["Nomor SK", sk.nomor, true], ["Nama", sk.nama_penerima], ["Jabatan", sk.jabatan], ["Ditetapkan", formatTanggal(sk.tanggal_ditetapkan)],
  ];
  return (
    <PublicLayout>
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-5 md:py-12">
        <div className={`overflow-hidden rounded-2xl border bg-card ${valid ? "border-success/40" : "border-destructive/40"}`}>
          <div className={`relative px-5 pb-6 pt-7 text-center sm:px-8 md:flex md:items-center md:gap-6 md:text-left ${valid ? "bg-success/10" : "bg-destructive/10"}`}>
            <div className={`mx-auto grid h-16 w-16 shrink-0 place-items-center rounded-full border-2 bg-background md:mx-0 md:h-20 md:w-20 ${valid ? "border-success/60" : "border-destructive/60"}`}>
              {valid ? <BadgeCheck className={`h-9 w-9 md:h-11 md:w-11 ${tone}`} /> : <ShieldX className={`h-9 w-9 md:h-11 md:w-11 ${tone}`} />}
            </div>
            <div className="mt-4 min-w-0 flex-1 md:mt-0">
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${valid ? "border-success/40 text-success" : "border-destructive/40 text-destructive"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${valid ? "bg-success" : "bg-destructive"}`} />
                {valid ? "Terverifikasi asli" : "SK sudah dicabut"}
              </span>
              <h1 className="mt-3 text-[1.6rem] font-black uppercase leading-[1.05] sm:text-3xl md:text-4xl">
                {valid ? <>SK Resmi <span className="block sm:inline">DPD ARMI Jawa Barat</span></> : "SK Ini Tidak Berlaku Lagi"}
              </h1>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground md:mx-0">
                {valid ? "Surat Keputusan ini tercatat resmi di sistem DPD ARMI Jawa Barat. Dokumen di bawah adalah salinan asli yang tersimpan."
                  : "SK ini pernah diterbitkan DPD ARMI Jawa Barat namun telah dicabut dan tidak berlaku."}
              </p>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-px border-t border-border bg-border lg:grid-cols-4">
            {details.map(([k, v, wide]) => (
              <div key={k} className={`min-w-0 bg-card px-5 py-4 ${wide ? "col-span-2 lg:col-span-1" : ""} ${k === "Jabatan" ? "col-span-2 sm:col-span-1" : ""}`}>
                <dt className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{k}</dt>
                <dd className={`mt-1 break-words text-sm font-semibold ${wide ? "font-mono" : ""}`}>{v}</dd>
              </div>
            ))}
          </dl>

          <div className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-center text-xs text-muted-foreground sm:text-left">Diterbitkan oleh <span className="font-semibold text-foreground">DPD ARMI Jawa Barat</span> · dpdarmijabar.com</p>
            <button onClick={() => window.print()} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary-dark sm:w-auto sm:py-2.5">
              <Printer className="h-4 w-4" /> Cetak / Simpan PDF
            </button>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-[210mm]">
          <div className="mb-3 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            <span className="h-px flex-1 bg-border" />Salinan Dokumen Resmi<span className="h-px flex-1 bg-border" />
          </div>
          <SkScaler><SkDocument sk={sk} qr={qr} /></SkScaler>
        </div>
      </section>
    </PublicLayout>
  );
}
