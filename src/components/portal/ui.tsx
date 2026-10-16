import type { ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const inputCls = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary";
export const btnPrimary = "inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary-dark disabled:opacity-60";
export const btnSecondary = "inline-flex items-center justify-center gap-2 rounded-lg border border-input px-3 py-1.5 text-sm font-semibold hover:border-primary";
export const btnDanger = "inline-flex items-center justify-center gap-2 rounded-lg border border-destructive/40 px-3 py-1.5 text-sm font-semibold text-destructive hover:bg-destructive/10";

export function PageTitle({ title, desc, action }: { title: string; desc?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">{title}</h1>
        {desc && <p className="text-sm text-muted-foreground">{desc}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, icon, tone = "primary" }: { label: string; value: ReactNode; icon?: ReactNode; tone?: "primary" | "success" | "destructive" }) {
  const toneCls = { primary: "text-primary", success: "text-success", destructive: "text-destructive" }[tone];
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5">
      <div className="absolute -right-4 -top-4 h-16 w-16 racing-stripe opacity-10" />
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}<span className={toneCls}>{icon}</span>
      </div>
      <div className={`mt-2 font-display text-3xl font-black ${toneCls}`}>{value}</div>
    </div>
  );
}

export function Field({ label, children, error }: { label: string; children: ReactNode; error?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}

export function Modal({ open, onOpenChange, title, children }: { open: boolean; onOpenChange: (o: boolean) => void; title: string; children: ReactNode }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-card">
        <DialogHeader><DialogTitle className="font-display text-2xl font-extrabold tracking-tight">{title}</DialogTitle></DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
          <tr>{head.map((h) => <th key={h} className="whitespace-nowrap px-4 py-3 font-semibold">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-border">{children}</tbody>
      </table>
    </div>
  );
}

export const td = "px-4 py-3 align-top";

export function TipeBadge({ tipe }: { tipe: "pemasukan" | "pengeluaran" }) {
  return tipe === "pemasukan"
    ? <span className="rounded-md bg-success/20 px-2 py-0.5 text-xs font-semibold text-success">Pemasukan</span>
    : <span className="rounded-md bg-destructive/20 px-2 py-0.5 text-xs font-semibold text-destructive">Pengeluaran</span>;
}
