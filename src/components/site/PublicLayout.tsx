import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import logoDpd from "@/assets/logo-dpd-jabar.png.asset.json";
import logoArmi from "@/assets/logo-armi.png.asset.json";

export { logoArmi, logoDpd };

const NAV = [
  { to: "/", label: "Beranda" },
  { to: "/tentang", label: "Tentang Kami" },
  { to: "/anggota", label: "Cari Anggota" },
  { to: "/info-kegiatan", label: "Kegiatan" },
  { to: "/kontak", label: "Kontak" },
] as const;

/** Official ARMI DPD Jawa Barat logo. */
export function LogoMark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const cls = { sm: "h-8 w-8", md: "h-11 w-11", lg: "h-24 w-24" }[size];
  return <img src={logoDpd.url} alt="Logo ARMI DPD Jawa Barat" width={507} height={492} className={`${cls} shrink-0 object-contain`} />;
}

export function Brand({ sub = true }: { sub?: boolean }) {
  return (
    <span className="flex items-center gap-3">
      <LogoMark />
      <span className="leading-tight">
        <span className="block font-display text-base font-black uppercase tracking-[0.12em] leading-none"><span className="text-primary">ARMI</span> DPD JABAR</span>
        {sub && <span className="block text-[11px] text-muted-foreground">Anggota Rental Mobil Indonesia</span>}
      </span>
    </span>
  );
}

export function PublicLayout({ children, overlay = false }: { children: ReactNode; overlay?: boolean }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on(); window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const solid = !overlay || scrolled || open;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className={`${overlay ? "fixed" : "sticky"} inset-x-0 top-0 z-40 border-b transition-colors duration-300 ${solid ? "border-border bg-background/95 backdrop-blur" : "border-transparent bg-transparent"}`}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5">
          <Link to="/" aria-label="Beranda ARMI DPD Jabar"><Brand /></Link>
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Navigasi utama">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} activeOptions={{ exact: true }}
                className="relative py-5 text-[11px] font-bold uppercase tracking-[0.18em] text-foreground/60 transition-colors hover:text-foreground"
                activeProps={{ className: "!text-foreground after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary !text-primary" }}>
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-4 lg:flex">
            <Link to="/login" className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary hover:text-foreground">Portal Login</Link>
            <Link to="/kontak" className="rounded-md bg-primary px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-primary-foreground shadow-glow transition-colors hover:bg-primary-dark">
              Gabung ARMI
            </Link>
          </div>
          <button className="rounded-md p-2 lg:hidden" onClick={() => setOpen(!open)} aria-label={open ? "Tutup menu" : "Buka menu"} aria-expanded={open}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
        {open && (
          <nav className="flex flex-col border-t border-border bg-background px-5 pb-5 pt-2 lg:hidden">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} activeOptions={{ exact: true }}
                className="border-b border-border py-3 text-sm font-medium" activeProps={{ className: "text-primary" }}>
                {n.label}
              </Link>
            ))}
            <Link to="/login" className="border-b border-border py-3 text-sm font-medium">Masuk Portal</Link>
            <Link to="/kontak" className="mt-4 rounded-md bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground">Gabung ARMI</Link>
          </nav>
        )}
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border bg-background">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Brand />
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Anggota Rental Mobil Indonesia — Dewan Pimpinan Daerah Jawa Barat.
            </p>
            <p className="mt-3 font-script text-lg text-primary">Tri Arutala — Kebersamaan, Keamanan, Professionalitas</p>
          </div>
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Navigasi</h3>
            <ul className="space-y-2 text-sm">
              {NAV.map((n) => <li key={n.to}><Link to={n.to} className="hover:text-primary">{n.label}</Link></li>)}
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Organisasi</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/tentang" className="hover:text-primary">Profil & Visi Misi</Link></li>
              <li><Link to="/kontak" className="hover:text-primary">Informasi Keanggotaan</Link></li>
              <li><Link to="/login" className="hover:text-primary">Portal Anggota</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border">
          <p className="mx-auto max-w-7xl px-5 py-5 text-xs text-muted-foreground">© 2026 Dewan Pimpinan Daerah ARMI Jawa Barat</p>
        </div>
      </footer>
    </div>
  );
}

export function PageHeading({ eyebrow, title, desc }: { eyebrow: string; title: string; desc?: string }) {
  return (
    <div className="mb-10 max-w-3xl">
      <span className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/80"><span className="text-primary">— </span>{eyebrow}</span>
      <h1 className="mt-3 text-4xl font-black uppercase leading-[0.95] tracking-wide md:text-5xl">{title}</h1>
      {desc && <p className="mt-3 text-base text-muted-foreground">{desc}</p>}
    </div>
  );
}

export function PageHero({ image, eyebrow, title, desc }: { image: string; eyebrow: string; title: string; desc?: string }) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <img src={image} alt="" width={1408} height={1008} className="absolute inset-0 h-full w-full object-cover opacity-40" />
      <div className="absolute inset-0 bg-hero-overlay" />
      <div className="relative mx-auto max-w-7xl px-5 py-20 md:py-28">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/80"><span className="text-primary">— </span>{eyebrow}</span>
        <h1 className="mt-3 max-w-3xl text-4xl font-black uppercase leading-[0.95] tracking-wide md:text-6xl">{title}</h1>
        <div aria-hidden className="mt-3 h-1.5 w-24 -skew-x-12 bg-primary" />
        {desc && <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">{desc}</p>}
      </div>
    </section>
  );
}
