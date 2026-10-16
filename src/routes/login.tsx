import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LOGIN_ERRORS, LOGO_URL, nomorToEmail, validateLoginInput } from "@/lib/armi";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Masuk Portal — ARMI DPD Jawa Barat" },
      { name: "description", content: "Masuk ke portal anggota ARMI DPD Jawa Barat." },
      { property: "og:title", content: "Portal ARMI DPD Jawa Barat" },
      { property: "og:description", content: "Masuk dengan nomor anggota dan password." },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [nomor, setNomor] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = validateLoginInput(nomor, password);
    if (v) return setError(v);
    setLoading(true); setError(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email: nomorToEmail(nomor), password });
    if (error || !data.user) {
      setLoading(false);
      return setError(/banned/i.test(error?.message ?? "") ? LOGIN_ERRORS.nonaktif : LOGIN_ERRORS.salah);
    }
    const { data: me } = await supabase.from("anggota").select("status").eq("user_id", data.user.id).maybeSingle();
    if (!me || me.status !== "aktif") {
      await supabase.auth.signOut();
      setLoading(false);
      return setError(me ? LOGIN_ERRORS.nonaktif : LOGIN_ERRORS.salah);
    }
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4">
      <div className="absolute inset-x-0 top-0 h-1.5 racing-stripe" />
      <form onSubmit={submit} className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-glow">
        <img src={LOGO_URL} alt="Logo ARMI" width={96} height={96} className="mx-auto h-24 w-24 rounded-xl" />
        <h1 className="mt-4 text-center text-3xl font-black uppercase italic">Portal <span className="text-primary">ARMI</span></h1>
        <p className="text-center text-sm text-muted-foreground">DPD Jawa Barat</p>
        <div className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-semibold" htmlFor="nomor">Nomor Anggota</label>
            <input id="nomor" value={nomor} onChange={(e) => setNomor(e.target.value.toUpperCase())} placeholder="ARMI-JBR-0001"
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 outline-none focus:border-primary" />
          </div>
          <div>
            <label className="text-sm font-semibold" htmlFor="pw">Password</label>
            <input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 outline-none focus:border-primary" />
          </div>
          {error && <p className="rounded-lg bg-destructive/15 px-3 py-2 text-sm text-destructive">{error}</p>}
          <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-bold text-primary-foreground hover:bg-primary-dark disabled:opacity-60">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />} Masuk
          </button>
        </div>
        <Link to="/" className="mt-6 flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Kembali ke beranda
        </Link>
      </form>
    </div>
  );
}
