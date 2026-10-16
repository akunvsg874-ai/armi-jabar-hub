import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LOGIN_ERRORS, nomorToEmail, validateLoginInput } from "@/lib/armi";
import { LogoMark } from "@/components/site/PublicLayout";
import heroImg from "@/assets/hero-cars.jpg";

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
  const [show, setShow] = useState(false);
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

  const input = "mt-1.5 w-full rounded-md border border-input bg-background px-3.5 py-2.5 text-[15px] outline-none transition-colors focus:border-primary";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
      <img src={heroImg} alt="" width={1600} height={912} className="absolute inset-0 h-full w-full object-cover opacity-25" />
      <div className="absolute inset-0 bg-hero-overlay" />
      <form onSubmit={submit} noValidate className="relative w-full max-w-sm rounded-lg border border-border bg-card/95 p-8 backdrop-blur">
        <div className="flex flex-col items-center text-center">
          <LogoMark size="lg" />
          <h1 className="mt-4 text-2xl font-bold uppercase">ARMI DPD JABAR</h1>
          <p className="mt-1 text-sm text-muted-foreground">Masuk ke portal anggota</p>
        </div>
        <div className="mt-8 space-y-4">
          <div>
            <label className="text-sm font-semibold" htmlFor="nomor">Nomor Anggota</label>
            <input id="nomor" autoComplete="username" value={nomor} onChange={(e) => setNomor(e.target.value.toUpperCase())} placeholder="ARMI-JBR-0001" className={input} />
          </div>
          <div>
            <label className="text-sm font-semibold" htmlFor="pw">Password</label>
            <div className="relative">
              <input id="pw" type={show ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={`${input} pr-11`} />
              <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
                className="absolute right-2 top-1/2 mt-[3px] -translate-y-1/2 rounded p-1.5 text-muted-foreground hover:text-foreground">
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {error && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
          <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-dark disabled:opacity-60">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />} Masuk
          </button>
        </div>
        <Link to="/" className="mt-6 flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Kembali ke beranda
        </Link>
      </form>
    </div>
  );
}
