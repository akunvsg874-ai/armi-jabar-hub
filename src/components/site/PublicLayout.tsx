import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Menu, X, LogIn } from "lucide-react";
import { LOGO_URL } from "@/lib/armi";

const NAV = [
  { to: "/", label: "Beranda" },
  { to: "/tentang", label: "Tentang Kami" },
  { to: "/anggota", label: "Cari Anggota" },
  { to: "/kegiatan-publik", label: "Kegiatan" },
  { to: "/kontak", label: "Kontak" },
] as const;

export function PublicLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="h-1 racing-stripe opacity-80" />
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-3">
            <img src={LOGO_URL} alt="Logo ARMI" width={40} height={40} className="h-10 w-10 rounded-lg" />
            <span className="font-display text-xl font-black italic tracking-wide">
              ARMI <span className="text-primary">DPD JABAR</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} activeOptions={{ exact: true }}
                className="rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground"
                activeProps={{ className: "text-primary" }}>
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-2 lg:flex">
            <Link to="/login" className="inline-flex items-center gap-2 rounded-lg border border-input px-4 py-2 text-sm font-semibold hover:border-primary">
              <LogIn className="h-4 w-4" /> Masuk
            </Link>
            <Link to="/kontak" className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-glow hover:bg-primary-dark">
              Gabung Anggota
            </Link>
          </div>
          <button className="lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X /> : <Menu />}
          </button>
        </div>
        {open && (
          <nav className="flex flex-col gap-1 border-t border-border px-4 py-3 lg:hidden">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm font-semibold">
                {n.label}
              </Link>
            ))}
            <Link to="/login" className="rounded-md px-3 py-2 text-sm font-semibold">Masuk</Link>
            <Link to="/kontak" className="mt-2 rounded-lg bg-primary px-4 py-2 text-center text-sm font-bold text-primary-foreground">Gabung Anggota</Link>
          </nav>
        )}
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-8 text-sm text-muted-foreground md:flex-row">
          <p>© 2026 Dewan Pimpinan Daerah ARMI Jawa Barat</p>
          <p className="font-display text-base font-bold italic tracking-wide text-primary">
            Tri Arutala — Kebersamaan, Keamanan, Professionalitas
          </p>
        </div>
      </footer>
    </div>
  );
}

export function PageHeading({ eyebrow, title, desc }: { eyebrow: string; title: string; desc?: string }) {
  return (
    <div className="mb-10">
      <span className="skew-tag inline-block bg-primary px-4 py-1 text-xs font-bold uppercase tracking-widest text-primary-foreground">
        {eyebrow}
      </span>
      <h1 className="mt-4 text-4xl font-black uppercase md:text-5xl">{title}</h1>
      {desc && <p className="mt-3 max-w-2xl text-muted-foreground">{desc}</p>}
    </div>
  );
}
