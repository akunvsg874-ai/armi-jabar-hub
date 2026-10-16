import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type LightboxItem = { src: string; alt?: string; caption?: string };

const navBtn =
  "absolute top-1/2 z-10 -translate-y-1/2 rounded-full border border-border bg-card/85 p-2.5 text-foreground transition-colors hover:border-primary hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const pad = (n: number) => String(n).padStart(2, "0");

/** Full-screen photo viewer with keyboard + arrow navigation. */
export function Lightbox({
  items,
  open,
  onOpenChange,
  startIndex = 0,
}: {
  items: LightboxItem[];
  open: boolean;
  onOpenChange: (o: boolean) => void;
  startIndex?: number;
}) {
  const n = items.length;
  const [idx, setIdx] = useState(startIndex);

  useEffect(() => {
    if (open) setIdx(Math.min(Math.max(startIndex, 0), Math.max(n - 1, 0)));
  }, [open, startIndex, n]);

  useEffect(() => {
    if (!open || n < 2) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setIdx((p) => (p + 1) % n);
      else if (e.key === "ArrowLeft") setIdx((p) => (p - 1 + n) % n);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, n]);

  const item = items[idx];
  if (!item) return null;
  const judul = item.caption || item.alt || "Foto ARMI";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "w-[min(1180px,94vw)] max-w-none gap-0 overflow-hidden border-border bg-background/95 p-0 backdrop-blur",
          "[&>button]:right-3 [&>button]:top-3 [&>button]:rounded-full [&>button]:border [&>button]:border-border [&>button]:bg-card [&>button]:p-2 [&>button]:opacity-100 [&>button]:hover:border-primary [&>button]:hover:text-primary",
        )}
      >
        <DialogTitle className="sr-only">{judul}</DialogTitle>
        <DialogDescription className="sr-only">
          Foto {idx + 1} dari {n} dokumentasi kegiatan ARMI DPD Jawa Barat.
        </DialogDescription>

        <div className="relative flex items-center justify-center bg-background p-3 sm:p-6">
          <img
            src={item.src}
            alt={item.alt || judul}
            className="max-h-[76vh] w-auto max-w-full rounded-md object-contain"
          />
          {n > 1 && (
            <>
              <button
                type="button"
                onClick={() => setIdx((p) => (p - 1 + n) % n)}
                aria-label="Foto sebelumnya"
                className={cn(navBtn, "left-2 sm:left-4")}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setIdx((p) => (p + 1) % n)}
                aria-label="Foto berikutnya"
                className={cn(navBtn, "right-2 sm:right-4")}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-border px-5 py-3">
          <p className="truncate text-sm font-bold uppercase tracking-[0.14em]">{judul}</p>
          <span className="shrink-0 text-xs font-semibold tracking-[0.2em] text-muted-foreground">
            {pad(idx + 1)} / {pad(n)}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
