/**
 * Client-side upload safety checks (magic bytes, dangerous names, MIME match).
 * Not a full antivirus — blocks common malware packaging tricks before upload.
 */

const BLOCKED_EXT = new Set([
  ".exe",
  ".dll",
  ".bat",
  ".cmd",
  ".com",
  ".msi",
  ".scr",
  ".ps1",
  ".vbs",
  ".js",
  ".jse",
  ".wsf",
  ".wsh",
  ".jar",
  ".apk",
  ".dmg",
  ".pkg",
  ".sh",
  ".bin",
  ".iso",
  ".html",
  ".htm",
  ".svg",
  ".php",
  ".asp",
  ".aspx",
]);

const IMAGE_SIGS: Array<{ mime: string; check: (b: Uint8Array) => boolean }> = [
  {
    mime: "image/jpeg",
    check: (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    mime: "image/png",
    check: (b) =>
      b.length >= 8 &&
      b[0] === 0x89 &&
      b[1] === 0x50 &&
      b[2] === 0x4e &&
      b[3] === 0x47,
  },
  {
    mime: "image/gif",
    check: (b) =>
      b.length >= 6 &&
      b[0] === 0x47 &&
      b[1] === 0x49 &&
      b[2] === 0x46 &&
      b[3] === 0x38,
  },
  {
    mime: "image/webp",
    check: (b) =>
      b.length >= 12 &&
      b[0] === 0x52 &&
      b[1] === 0x49 &&
      b[2] === 0x46 &&
      b[3] === 0x46 &&
      b[8] === 0x57 &&
      b[9] === 0x45 &&
      b[10] === 0x42 &&
      b[11] === 0x50,
  },
];

const VIDEO_SIGS: Array<{ mime: string; check: (b: Uint8Array) => boolean }> = [
  // ISO BMFF (mp4, mov, m4v) — ftyp at offset 4
  {
    mime: "video/mp4",
    check: (b) =>
      b.length >= 12 &&
      b[4] === 0x66 &&
      b[5] === 0x74 &&
      b[6] === 0x79 &&
      b[7] === 0x70,
  },
  {
    mime: "video/quicktime",
    check: (b) =>
      b.length >= 12 &&
      b[4] === 0x66 &&
      b[5] === 0x74 &&
      b[6] === 0x79 &&
      b[7] === 0x70,
  },
  // WebM / Matroska EBML
  {
    mime: "video/webm",
    check: (b) =>
      b.length >= 4 && b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3,
  },
  {
    mime: "video/x-matroska",
    check: (b) =>
      b.length >= 4 && b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3,
  },
  // Ogg
  {
    mime: "video/ogg",
    check: (b) =>
      b.length >= 4 && b[0] === 0x4f && b[1] === 0x67 && b[2] === 0x67 && b[3] === 0x53,
  },
];

function extensionOf(name: string): string {
  const i = name.lastIndexOf(".");
  if (i < 0) return "";
  return name.slice(i).toLowerCase();
}

function looksLikeScript(bytes: Uint8Array): boolean {
  // PE executable MZ
  if (bytes.length >= 2 && bytes[0] === 0x4d && bytes[1] === 0x5a) return true;
  // ELF
  if (
    bytes.length >= 4 &&
    bytes[0] === 0x7f &&
    bytes[1] === 0x45 &&
    bytes[2] === 0x4c &&
    bytes[3] === 0x46
  )
    return true;
  // Shebang
  if (bytes.length >= 2 && bytes[0] === 0x23 && bytes[1] === 0x21) return true;
  // HTML / JS polyglot start
  const head = new TextDecoder("utf-8", { fatal: false })
    .decode(bytes.slice(0, 64))
    .toLowerCase();
  if (head.includes("<script") || head.includes("<?php") || head.includes("%pdf"))
    return true;
  return false;
}

export type ScanResult = { ok: true } | { ok: false; reason: string };

export async function scanUploadFile(
  file: File,
  kind: "image" | "video",
): Promise<ScanResult> {
  const ext = extensionOf(file.name);
  if (BLOCKED_EXT.has(ext)) {
    return { ok: false, reason: "That file type is blocked for security." };
  }

  // Double extension trick: photo.jpg.exe
  const parts = file.name.toLowerCase().split(".");
  if (parts.length > 2) {
    for (let i = 1; i < parts.length - 1; i++) {
      if (BLOCKED_EXT.has(`.${parts[i]}`)) {
        return { ok: false, reason: "Suspicious file name blocked." };
      }
    }
  }

  const buf = new Uint8Array(await file.slice(0, 64).arrayBuffer());
  if (looksLikeScript(buf)) {
    return { ok: false, reason: "File looks like an executable or script. Blocked." };
  }

  const sigs = kind === "image" ? IMAGE_SIGS : VIDEO_SIGS;
  const matched = sigs.some((s) => s.check(buf));
  if (!matched) {
    return {
      ok: false,
      reason:
        kind === "image"
          ? "File content is not a valid image (signature check failed)."
          : "File content is not a valid video (signature check failed).",
    };
  }

  // MIME claimed by browser should be in allowed family
  if (kind === "image" && file.type && !file.type.startsWith("image/")) {
    return { ok: false, reason: "MIME type does not match an image." };
  }
  if (kind === "video" && file.type && !file.type.startsWith("video/")) {
    return { ok: false, reason: "MIME type does not match a video." };
  }

  return { ok: true };
}
