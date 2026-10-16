import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { inputCls, btnSecondary } from "./ui";

/** URL field + upload button. Uploads to the media bucket and stores a long-lived signed URL. */
export function ImageInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  async function upload(f: File) {
    if (!f.type.startsWith("image/")) return void toast.error("File harus berupa gambar");
    if (f.size > 5 * 1024 * 1024) return void toast.error("Maksimal 5 MB");
    setBusy(true);
    const path = `${Date.now()}-${f.name.replace(/[^a-zA-Z0-9.]+/g, "-")}`;
    const { error } = await supabase.storage.from("media").upload(path, f, { contentType: f.type });
    if (error) { setBusy(false); return void toast.error("Gagal mengunggah"); }
    const { data } = await supabase.storage.from("media").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
    setBusy(false);
    if (data?.signedUrl) { onChange(data.signedUrl); toast.success("Foto diunggah"); }
  }
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://… atau unggah" />
        <button type="button" className={btnSecondary} disabled={busy} onClick={() => ref.current?.click()}><Upload className="h-4 w-4" />{busy ? "…" : "Unggah"}</button>
        {value && <button type="button" className={btnSecondary} onClick={() => onChange("")} aria-label="Hapus foto"><X className="h-4 w-4" /></button>}
      </div>
      <input ref={ref} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} />
      {value && <img src={value} alt="" className="h-24 rounded border border-border object-cover" />}
    </div>
  );
}
