import { toast } from "sonner";

import { triggerDownload } from "@/lib/clipboard";
import { getDrop } from "@/lib/drops.functions";

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = CRC_TABLE[(crc ^ data[i]!) & 0xff]! ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function u16(n: number) {
  const b = new Uint8Array(2);
  new DataView(b.buffer).setUint16(0, n >>> 0, true);
  return b;
}

function u32(n: number) {
  const b = new Uint8Array(4);
  new DataView(b.buffer).setUint32(0, n >>> 0, true);
  return b;
}

function concat(parts: Uint8Array[]) {
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const p of parts) {
    out.set(p, offset);
    offset += p.length;
  }
  return out;
}

function safeName(name: string, used: Set<string>): string {
  const cleaned = name.replace(/[\\/:*?"<>|]+/g, "_").replace(/\s+/g, " ").trim() || "file";
  let next = cleaned;
  let i = 2;
  while (used.has(next.toLowerCase())) {
    const dot = cleaned.lastIndexOf(".");
    next =
      dot > 0
        ? `${cleaned.slice(0, dot)} (${i})${cleaned.slice(dot)}`
        : `${cleaned} (${i})`;
    i++;
  }
  used.add(next.toLowerCase());
  return next;
}

export async function zipAndDownload(
  files: { name: string; data: Uint8Array }[],
  zipName: string,
) {
  const used = new Set<string>();
  const locals: Uint8Array[] = [];
  const centrals: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const name = safeName(file.name, used);
    const nameBytes = new TextEncoder().encode(name);
    const data = file.data;
    const crc = crc32(data);
    const local = concat([
      u32(0x04034b50),
      u16(20),
      u16(1 << 11),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(data.length),
      u32(data.length),
      u16(nameBytes.length),
      u16(0),
      nameBytes,
      data,
    ]);
    const central = concat([
      u32(0x02014b50),
      u16(20),
      u16(20),
      u16(1 << 11),
      u16(0),
      u16(0),
      u16(0),
      u32(crc),
      u32(data.length),
      u32(data.length),
      u16(nameBytes.length),
      u16(0),
      u16(0),
      u16(0),
      u16(0),
      u32(0),
      u32(offset),
      nameBytes,
    ]);
    locals.push(local);
    centrals.push(central);
    offset += local.length;
  }

  const centralDir = concat(centrals);
  const eocd = concat([
    u32(0x06054b50),
    u16(0),
    u16(0),
    u16(files.length),
    u16(files.length),
    u32(centralDir.length),
    u32(offset),
    u16(0),
  ]);

  const zip = concat([...locals, centralDir, eocd]);
  const blob = new Blob([zip], { type: "application/zip" });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, zipName.endsWith(".zip") ? zipName : `${zipName}.zip`);
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export async function downloadDropsAsZip(
  codes: string[],
  zipName: string,
  onProgress?: (done: number, total: number) => void,
): Promise<{ ok: number; locked: number }> {
  if (!codes.length) {
    toast.error("Select at least one item.");
    return { ok: 0, locked: 0 };
  }

  const files: { name: string; data: Uint8Array }[] = [];
  let locked = 0;

  for (let i = 0; i < codes.length; i++) {
    const c = codes[i]!;
    onProgress?.(i, codes.length);
    const result = await getDrop({ data: { code: c } });
    if (result.state === "locked") {
      locked++;
      continue;
    }
    if (result.state !== "ok") continue;

    if (result.type === "text") {
      const data = new TextEncoder().encode(result.content ?? "");
      files.push({
        name: `${result.originalFilename ?? result.title ?? result.code}.txt`.replace(
          /\.txt\.txt$/i,
          ".txt",
        ),
        data,
      });
    } else if (result.fileUrl) {
      try {
        const response = await fetch(result.fileUrl);
        if (!response.ok) throw new Error("fail");
        const buf = new Uint8Array(await response.arrayBuffer());
        files.push({
          name: result.originalFilename ?? result.title ?? result.code,
          data: buf,
        });
      } catch {
        toast.error(`Could not add ${c}`);
      }
    }
  }

  onProgress?.(codes.length, codes.length);

  if (!files.length) {
    if (locked) toast.error("Password-protected items need to be opened one by one.");
    else toast.error("Nothing could be downloaded.");
    return { ok: 0, locked };
  }

  if (files.length === 1) {
    const only = files[0]!;
    const blob = new Blob([only.data]);
    const url = URL.createObjectURL(blob);
    triggerDownload(url, only.name);
    window.setTimeout(() => URL.revokeObjectURL(url), 4000);
    toast.success("Download started");
    return { ok: 1, locked };
  }

  await zipAndDownload(files, zipName);
  toast.success(`Saved ${files.length} files in one ZIP`);
  return { ok: files.length, locked };
}
