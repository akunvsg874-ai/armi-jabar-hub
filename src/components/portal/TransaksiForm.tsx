import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { KATEGORI, KATEGORI_LABEL, todayISO, validateTransaksi, type Kategori } from "@/lib/armi";
import type { Database } from "@/integrations/supabase/types";
import { Field, inputCls, btnPrimary, btnSecondary } from "./ui";

type Trx = Database["public"]["Tables"]["transaksi"]["Row"];

export function TransaksiForm({ initial, nomor, isAdmin, onDone }: { initial?: Trx | null; nomor: string; isAdmin: boolean; onDone: () => void }) {
  const qc = useQueryClient();
  const [kategori, setKategori] = useState<Kategori | "">(initial?.kategori ?? "");
  const [sub, setSub] = useState(initial?.sub_kategori ?? "");
  const [tipe, setTipe] = useState<"pemasukan" | "pengeluaran">(initial?.tipe ?? "pemasukan");
  const [nominal, setNominal] = useState(initial ? String(initial.nominal) : "");
  const [tanggal, setTanggal] = useState(initial?.tanggal ?? todayISO());
  const [ket, setKet] = useState(initial?.keterangan ?? "");
  const [err, setErr] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [newSub, setNewSub] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: subs = [] } = useQuery({
    queryKey: ["sub_kategori"],
    queryFn: async () => (await supabase.from("sub_kategori").select("*").order("nama")).data ?? [],
  });
  const options = subs.filter((s) => s.kategori === kategori);

  async function addSub() {
    if (!kategori || !newSub.trim()) return;
    const { error } = await supabase.from("sub_kategori").insert({ kategori, nama: newSub.trim() });
    if (error) return toast.error("Gagal menambah sub-kategori");
    await qc.invalidateQueries({ queryKey: ["sub_kategori"] });
    setSub(newSub.trim()); setNewSub(""); setAdding(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const n = Number(nominal);
    const v = validateTransaksi({ kategori, nominal: n });
    if (v) return setErr(v);
    if (!sub) return setErr("Sub-kategori wajib dipilih");
    setSaving(true);
    const payload = { kategori: kategori as Kategori, sub_kategori: sub, tipe, nominal: n, tanggal, keterangan: ket || null };
    const { error } = initial
      ? await supabase.from("transaksi").update(payload).eq("id", initial.id)
      : await supabase.from("transaksi").insert({ ...payload, input_by: nomor });
    setSaving(false);
    if (error) return toast.error("Gagal menyimpan transaksi");
    toast.success("Transaksi tersimpan");
    qc.invalidateQueries({ queryKey: ["transaksi"] });
    onDone();
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <Field label="Kategori">
        <select className={inputCls} value={kategori} onChange={(e) => { setKategori(e.target.value as Kategori); setSub(""); }}>
          <option value="">Pilih kategori</option>
          {KATEGORI.map((k) => <option key={k} value={k}>{KATEGORI_LABEL[k]}</option>)}
        </select>
      </Field>
      <Field label="Sub-Kategori">
        <div className="flex gap-2">
          <select className={inputCls} value={sub} onChange={(e) => setSub(e.target.value)} disabled={!kategori}>
            <option value="">Pilih sub-kategori</option>
            {options.map((s) => <option key={s.id} value={s.nama}>{s.nama}</option>)}
            {sub && !options.some((o) => o.nama === sub) && <option value={sub}>{sub}</option>}
          </select>
          {isAdmin && (
            <button type="button" className={btnSecondary} disabled={!kategori} onClick={() => setAdding(!adding)} title="Tambah Sub-Kategori">
              <Plus className="h-4 w-4" />
            </button>
          )}
        </div>
        {adding && (
          <div className="mt-2 flex gap-2">
            <input className={inputCls} placeholder="Nama sub-kategori baru" value={newSub} onChange={(e) => setNewSub(e.target.value)} />
            <button type="button" className={btnPrimary} onClick={addSub}>Tambah</button>
          </div>
        )}
      </Field>
      <Field label="Tipe">
        <select className={inputCls} value={tipe} onChange={(e) => setTipe(e.target.value as typeof tipe)}>
          <option value="pemasukan">Pemasukan</option>
          <option value="pengeluaran">Pengeluaran</option>
        </select>
      </Field>
      <Field label="Nominal (Rp)">
        <input type="number" min={0} className={inputCls} value={nominal} onChange={(e) => setNominal(e.target.value)} />
      </Field>
      <Field label="Tanggal">
        <input type="date" className={inputCls} value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
      </Field>
      <Field label="Keterangan">
        <textarea className={inputCls} rows={3} value={ket} onChange={(e) => setKet(e.target.value)} maxLength={500} />
      </Field>
      {err && <p className="rounded-lg bg-destructive/15 px-3 py-2 text-sm text-destructive">{err}</p>}
      <button disabled={saving} className={`${btnPrimary} w-full`}>Simpan</button>
    </form>
  );
}
