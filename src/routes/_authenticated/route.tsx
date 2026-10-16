import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { LayoutDashboard, Users, ShieldAlert, Wallet, CalendarDays, UserCircle, LogOut, Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { meQuery, type Role } from "@/lib/session";
import { LOGO_URL } from "@/lib/armi";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ context }) => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/login" });
    const me = await context.queryClient.fetchQuery(meQuery);
    if (!me || me.status !== "aktif") {
      await supabase.auth.signOut();
      throw redirect({ to: "/login" });
    }
    return { me };
  },
  component: PortalLayout,
});

type Item = { to: string; label: string; icon: typeof Users };
const MENU: Record<Role, Item[]> = {
  admin: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/anggota", label: "Kelola Anggota", icon: Users },
    { to: "/blacklist", label: "Blacklist Konsumen", icon: ShieldAlert },
    { to: "/keuangan", label: "Keuangan", icon: Wallet },
    { to: "/kegiatan", label: "Kelola Kegiatan", icon: CalendarDays },
  ],
  bendahara: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/keuangan", label: "Keuangan", icon: Wallet },
    { to: "/blacklist", label: "Blacklist Konsumen", icon: ShieldAlert },
    { to: "/kegiatan", label: "Kegiatan", icon: CalendarDays },
    { to: "/profil", label: "Profil Saya", icon: UserCircle },
  ],
  anggota: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/blacklist", label: "Blacklist Konsumen", icon: ShieldAlert },
    { to: "/kegiatan", label: "Kegiatan", icon: CalendarDays },
    { to: "/profil", label: "Profil Saya", icon: UserCircle },
  ],
};

function PortalLayout() {
  const { me } = Route.useRouteContext();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  async function logout() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  }

  const nav = (
    <nav className="flex flex-1 flex-col gap-1">
      {MENU[me.role].map((m) => (
        <Link key={m.to} to={m.to} onClick={() => setOpen(false)}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-sidebar-foreground transition hover:bg-sidebar-accent"
          activeProps={{ className: "bg-primary text-primary-foreground hover:bg-primary" }}>
          <m.icon className="h-4 w-4" /> {m.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-sidebar-border bg-sidebar p-4 transition-transform lg:static lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <Link to="/" className="mb-6 flex items-center gap-3">
          <img src={LOGO_URL} alt="Logo ARMI" width={40} height={40} className="h-10 w-10 rounded-lg" />
          <span className="font-display text-lg font-black">ARMI <span className="text-primary">JABAR</span></span>
        </Link>
        <div className="mb-4 rounded-lg border border-sidebar-border bg-background/40 p-3">
          <div className="truncate text-sm font-bold">{me.nama_lengkap}</div>
          <div className="text-xs text-muted-foreground">{me.nomor_anggota}</div>
          <span className="mt-2 inline-block rounded bg-primary/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary">{me.role}</span>
        </div>
        {nav}
        <button onClick={logout} className="mt-4 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/10">
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </aside>
      {open && <div className="fixed inset-0 z-30 bg-background/70 lg:hidden" onClick={() => setOpen(false)} />}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur lg:hidden">
          <button onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X /> : <Menu />}</button>
          <span className="font-display font-black">ARMI <span className="text-primary">JABAR</span></span>
        </header>
        <div className="h-1 racing-stripe opacity-60" />
        <main className="flex-1 p-4 md:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
