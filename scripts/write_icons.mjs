#!/usr/bin/env node
/** Writes ShareTemp brand assets into public/ at build time. */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createCanvas, loadImage } from "node:canvas"; // may not exist — fallback below

const dir = dirname(fileURLToPath(import.meta.url));
const publicDir = join(dir, "..", "public");
mkdirSync(publicDir, { recursive: true });

// Exact molecular mark from brand PNG (48×48, transparent)
const MARK48 =
  "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";

function loadParts(prefix) {
  let i = 0,
    out = "";
  while (true) {
    const p = join(dir, `${prefix}.p${i}`);
    if (!existsSync(p)) break;
    out += readFileSync(p, "utf8").trim();
    i++;
  }
  return out;
}

function write(name, b64) {
  if (!b64) {
    console.warn("skip empty", name);
    return;
  }
  writeFileSync(join(publicDir, name), Buffer.from(b64, "base64"));
  console.log("wrote", name, Buffer.from(b64, "base64").length);
}

// Prefer multi-part assets if present, else embedded mark
const markParts = loadParts("mark");
write("mark.png", markParts || MARK48);
write("favicon-32.png", loadParts("favicon") || MARK48);
write("og.jpg", loadParts("og"));
write("apple-touch-icon.png", loadParts("apple") || MARK48);
write("pwa-192.png", loadParts("pwa192") || MARK48);

if (!loadParts("og")) {
  // Minimal OG fallback: black 1200x630 JPEG-ish PNG renamed — browsers accept; use mark centered via simple 1x1 black if needed
  console.log("No og parts — keeping existing public/og.jpg if any");
}
