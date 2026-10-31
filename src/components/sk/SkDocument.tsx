import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import QRCode from "qrcode";
import logoDpd from "@/assets/sk-logo-dpd.png.asset.json";
import wordmark from "@/assets/sk-wordmark-armi.png.asset.json";
import { formatTanggal } from "@/lib/armi";
import { diktumLabel, diktumPertama, skVerifyUrl, type SkData } from "@/lib/sk";

/** Official DPD ARMI Jabar QR: high error correction with the DPD emblem in the middle. */
export function useSkQr(kode: string | undefined) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    if (!kode) return setSrc(null);
    let alive = true;
    (async () => {
      const canvas = document.createElement("canvas");
      await QRCode.toCanvas(canvas, skVerifyUrl(kode), { errorCorrectionLevel: "H", margin: 1, width: 480, color: { dark: "#000000", light: "#ffffff" } });
      const ctx = canvas.getContext("2d")!;
      const img = new Image();
      img.src = logoDpd.url;
      try {
        await img.decode();
        const s = canvas.width * 0.26, c = canvas.width / 2;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath(); ctx.arc(c, c, s / 2 + 6, 0, Math.PI * 2); ctx.fill();
        ctx.drawImage(img, c - s / 2, c - s / 2, s, s);
      } catch { /* QR still valid without the emblem */ }
      if (alive) setSrc(canvas.toDataURL("image/png"));
    })();
    return () => { alive = false; };
  }, [kode]);
  return src;
}

const FONT = { fontFamily: "Arial, Helvetica, sans-serif" } as const;
const SERIF = { fontFamily: "'Times New Roman', Times, serif" } as const;

function LetteredList({ items }: { items: string[] }) {
  return (
    <ol className="m-0 list-none p-0">
      {items.map((t, i) => (
        <li key={i} className="flex" style={{ textAlign: "justify" }}>
          <span className="shrink-0" style={{ width: "7mm" }}>{String.fromCharCode(97 + i)}.</span>
          <span className="flex-1">{t}</span>
        </li>
      ))}
    </ol>
  );
}

function Row({ label, children, colon = true }: { label: string; children: ReactNode; colon?: boolean }) {
  return (
    <div className="flex" style={{ marginBottom: "0.5mm" }}>
      <div className="shrink-0" style={{ width: "36mm" }}>{label}</div>
      <div className="shrink-0" style={{ width: "3.5mm" }}>{colon ? ":" : ""}</div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

/** One A4 sheet that mirrors the official SK template exactly (kop, isi, tanda tangan) plus the verification QR. */
export function SkDocument({ sk, qr }: { sk: Omit<SkData, "kode" | "status"> & { kode?: string }; qr: string | null }) {
  const tentang = sk.tentang.split("\n").map((l) => l.trim()).filter(Boolean);
  const diktum = [diktumPertama(sk.nama_penerima, sk.jabatan, sk.tingkat), ...sk.diktum_lain.filter((d) => d.trim())];
  return (
    <div className="sk-print relative flex flex-col bg-paper text-paper-foreground shadow-2xl"
      style={{ ...FONT, width: "210mm", minHeight: "297mm", padding: "5mm 18mm 8mm 20mm", fontSize: "12pt", lineHeight: 1.45, boxSizing: "border-box" }}>
      {/* Kop surat */}
      <header className="flex items-start" style={{ marginLeft: "-17mm", gap: "8mm" }}>
        <img src={logoDpd.url} alt="Logo DPD ARMI Jawa Barat" style={{ width: "34mm", height: "34mm", objectFit: "contain" }} />
        <div className="relative" style={{ width: "150mm" }}>
          <img src={wordmark.url} alt="ARMI — Anggota Rental Mobil Indonesia" style={{ width: "150mm", display: "block" }} />
          <div className="absolute whitespace-nowrap font-bold" style={{ ...SERIF, left: "13mm", top: "28.5mm", fontSize: "16.5pt", lineHeight: 1, letterSpacing: "0.01em" }}>
            DEWAN PIMPINAN DAERAH JAWA BARAT
          </div>
        </div>
      </header>
      <hr className="border-0 bg-paper-line" style={{ height: "0.35mm", margin: "6.5mm 0 0" }} />

      {/* Judul */}
      <div className="text-center" style={{ marginTop: "9mm" }}>
        <div>SURAT KEPUTUSAN KETUA ARMI</div>
        <div className="underline" style={{ textUnderlineOffset: "2px" }}>DEWAN PIMPINAN DAERAH JAWA BARAT</div>
        <div>Nomor : {sk.nomor || "…"}</div>
      </div>
      <div className="text-center uppercase" style={{ marginTop: "6mm" }}>
        {tentang.map((l, i) => <div key={i}>{i === 0 ? `TENTANG ${l}` : l}</div>)}
      </div>
      <div className="text-center" style={{ marginTop: "6mm" }}>KETUA ARMI DPD JAWA BARAT</div>

      {/* Pertimbangan */}
      <div style={{ marginTop: "6mm" }}>
        <Row label="Menimbang"><LetteredList items={sk.menimbang.filter((x) => x.trim())} /></Row>
        <Row label="Mengingat"><LetteredList items={sk.mengingat.filter((x) => x.trim())} /></Row>
      </div>

      <div className="text-center" style={{ marginTop: "11mm" }}>MEMUTUSKAN</div>
      <div style={{ marginTop: "10mm" }}>Menetapkan :</div>
      <div style={{ marginTop: "5mm" }}>
        {diktum.map((d, i) => <Row key={i} label={diktumLabel(i)}>{d}</Row>)}
      </div>

      {/* Pengesahan */}
      <div className="flex items-end justify-between" style={{ marginTop: "14mm" }}>
        <div className="text-center" style={{ width: "40mm" }}>
          {qr ? <img src={qr} alt="QR Code verifikasi SK" style={{ width: "32mm", height: "32mm", margin: "0 auto" }} />
            : <div className="mx-auto border border-dashed border-paper-line" style={{ width: "32mm", height: "32mm" }} />}
          <div className="text-paper-muted" style={{ fontSize: "7pt", lineHeight: 1.25, marginTop: "1mm" }}>Scan untuk verifikasi keaslian SK di dpdarmijabar.com</div>
        </div>
        <div style={{ width: "100mm" }}>
          <div className="flex"><span className="shrink-0" style={{ width: "27mm" }}>Ditetapkan di</span><span>: {sk.ditetapkan_di}</span></div>
          <div className="flex"><span className="shrink-0" style={{ width: "27mm" }}>Pada Tanggal</span><span>: {sk.tanggal_ditetapkan ? formatTanggal(sk.tanggal_ditetapkan) : "…"}</span></div>
          <div className="text-right" style={{ marginTop: "5mm", fontSize: "13pt" }}>{sk.jabatan_penandatangan}</div>
          {sk.ttd_url
            ? <img src={sk.ttd_url} alt="Tanda tangan" className="ml-auto" style={{ height: "20mm", objectFit: "contain", marginTop: "2mm" }} />
            : <div style={{ height: "5mm" }} />}
          <div className="text-right italic" style={{ marginTop: "1mm" }}>(ditandatangani secara elektronik)</div>
          <div className="text-right" style={{ fontSize: "13pt" }}>{sk.nama_penandatangan}</div>
        </div>
      </div>

      <div className="flex-1" />
      <hr className="border-0 bg-paper-line" style={{ height: "0.35mm", margin: "10mm 0 0" }} />
    </div>
  );
}

/** Scales the A4 sheet down to fit narrow containers (phones, side panels) without reflowing it. */
export function SkScaler({ children }: { children: ReactNode }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ scale: 1, h: 0 });
  useLayoutEffect(() => {
    const o = outer.current, i = inner.current;
    if (!o || !i) return;
    const update = () => {
      const scale = Math.min(1, o.clientWidth / i.offsetWidth);
      setBox({ scale, h: i.offsetHeight * scale });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(o); ro.observe(i);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={outer} className="sk-scaler w-full overflow-hidden" style={{ height: box.h || undefined }}>
      <div ref={inner} className="origin-top-left" style={{ width: "fit-content", transform: `scale(${box.scale})` }}>{children}</div>
    </div>
  );
}
