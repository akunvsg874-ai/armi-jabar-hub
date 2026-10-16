import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { PublicLayout, PageHero } from "@/components/site/PublicLayout";
import { supabase } from "@/integrations/supabase/client";
import { halamanQuery, seoMeta } from "@/lib/cms";
import { WILAYAH_JABAR } from "@/lib/armi";
import communityImg from "@/assets/community.jpg";

export const Route = createFileRoute("/gabung")({
  loader: ({ context }) => context.queryClient.ensureQueryData(halamanQuery("gabung")),
  head: ({ loaderData }) => seoMeta(loaderData, "gabung"),
  component: Page,
});

const schema = z.object({
  nama: z.string().trim().min(2, "Nama minimal 2 huruf").max(120),
  no_hp: z.string().trim().regex(/^[0-9+\- ]{8,20}$/, "Nomor HP tidak valid"),
  wilayah: z.string().min(1, "Pilih wilayah"),
  nama_usaha: z.string().trim().min(2, "Nama usaha wajib diisi").max(120),
  jumlah_unit: z.coerce.number().int().min(0).max(10000).optional(),
  pesan: z.string().trim().max(1000).optional(),
});

const input = "w-full rounded-md border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary";

function Page() {
  const { data: h } = useSuspenseQuery(halamanQuery("gabung"));
  const [f, setF] = useState({ nama: "", no_hp: "", wilayah: "", nama_usaha: "", jumlah_unit: "", pesan: "" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const r = schema.safeParse({ ...f, jumlah_unit: f.jumlah_unit || undefined, pesan: f.pesan || undefined });
    if (!r.success) return void toast.error(r.error.issues[0]?.message ?? "Data tidak valid");
    setBusy(true);
    const { error } = await supabase.from("pendaftaran").insert({ ...r.data, jumlah_unit: r.data.jumlah_unit ?? null, pesan: r.data.pesan ?? null });
    setBusy(false);
    if (error) return void toast.error("Gagal mengirim, coba lagi");
    setDone(true);
  }

  return (
    <PublicLayout>
      <PageHero image={h.hero_image || communityImg} eyebrow={h.hero_eyebrow} title={h.hero_title} desc={h.hero_desc} />
      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[1fr_1.3fr]">
        <div className="space-y-6">
          <h2 className="text-2xl font-black uppercase tracking-wide">Keuntungan Anggota</h2>
          {h.konten.map((s) => (
            <div key={s.judul} className="flex gap-4 border-l-2 border-primary pl-5">
              <div><div className="font-bold">{s.judul}</div><p className="mt-1 text-sm text-muted-foreground">{s.isi}</p></div>
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-border bg-card p-6 md:p-8">
          {done ? (
            <div className="py-10 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
              <h2 className="mt-4 text-2xl font-black uppercase">Pendaftaran Terkirim</h2>
              <p className="mt-2 text-muted-foreground">Sekretariat akan menghubungi Anda melalui nomor HP yang didaftarkan.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <h2 className="text-xl font-black uppercase tracking-wide">Formulir Pendaftaran</h2>
              <input className={input} placeholder="Nama lengkap" value={f.nama} onChange={set("nama")} maxLength={120} />
              <input className={input} placeholder="Nomor HP / WhatsApp" value={f.no_hp} onChange={set("no_hp")} maxLength={20} />
              <input className={input} placeholder="Nama usaha rental" value={f.nama_usaha} onChange={set("nama_usaha")} maxLength={120} />
              <div className="grid gap-4 sm:grid-cols-2">
                <select className={input} value={f.wilayah} onChange={set("wilayah")}>
                  <option value="">Pilih wilayah</option>
                  {WILAYAH_JABAR.map((w) => <option key={w}>{w}</option>)}
                </select>
                <input className={input} type="number" min={0} placeholder="Jumlah unit (opsional)" value={f.jumlah_unit} onChange={set("jumlah_unit")} />
              </div>
              <textarea className={input} rows={4} placeholder="Pesan (opsional)" value={f.pesan} onChange={set("pesan")} maxLength={1000} />
              <button disabled={busy} className="w-full rounded-md bg-primary px-6 py-4 text-sm font-bold uppercase tracking-[0.2em] text-primary-foreground shadow-glow hover:bg-primary-dark disabled:opacity-60">
                {busy ? "Mengirim…" : "Kirim Pendaftaran"}
              </button>
            </form>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
