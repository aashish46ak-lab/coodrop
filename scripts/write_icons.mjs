#!/usr/bin/env node
import { writeFileSync, mkdirSync, readFileSync, existsSync, copyFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
const dir = dirname(fileURLToPath(import.meta.url));
const root = join(dir, "..");
const publicDir = join(root, "public");
mkdirSync(publicDir, { recursive: true });
const names = ["favicon-32.png", "apple-touch-icon.png", "pwa-192.png", "mark.png", "pwa-512.png"];
function readB64(name) {
  const single = join(dir, name + ".b64");
  if (existsSync(single)) return readFileSync(single, "utf8").trim();
  let b64 = "";
  for (let i = 0; i < 40; i++) {
    const p = join(dir, name + ".b64.p" + i);
    if (!existsSync(p)) break;
    b64 += readFileSync(p, "utf8").trim();
  }
  return b64;
}
for (const name of names) {
  let b64 = readB64(name);
  if (!b64 && name === "pwa-512.png") {
    const markPath = join(publicDir, "mark.png");
    if (existsSync(markPath)) {
      copyFileSync(markPath, join(publicDir, "pwa-512.png"));
      console.log("wrote pwa-512.png (from mark)");
      continue;
    }
  }
  if (!b64) {
    console.warn("missing", name);
    continue;
  }
  writeFileSync(join(publicDir, name), Buffer.from(b64, "base64"));
  console.log("wrote", name);
}
