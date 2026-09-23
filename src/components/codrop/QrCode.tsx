import { useEffect, useRef } from "react";

/** Minimal QR via external API image (no heavy dependency). */
export function QrCode({
  value,
  size = 160,
  className,
}: {
  value: string;
  size?: number;
  className?: string;
}) {
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&margin=8`;

  return (
    <img
      src={src}
      width={size}
      height={size}
      alt="QR code"
      className={className}
      loading="lazy"
    />
  );
}

export function ShareQrBlock({ code }: { code: string }) {
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/drop/${code}`
      : `https://codrop.vercel.app/drop/${code}`;

  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4">
      <QrCode value={url} size={148} className="rounded-lg bg-white p-2" />
      <p className="text-xs text-muted-foreground">Scan to open this drop</p>
    </div>
  );
}
