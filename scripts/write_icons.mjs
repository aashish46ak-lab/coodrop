#!/usr/bin/env node
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const dir = dirname(fileURLToPath(import.meta.url));
const publicDir = join(dir, "..", "public");
mkdirSync(publicDir, { recursive: true });
function loadParts(prefix) {
  let i = 0, out = "";
  while (true) {
    const p = join(dir, `${prefix}.p${i}`);
    if (!existsSync(p)) break;
    out += readFileSync(p, "utf8").trim();
    i++;
  }
  if (!out) throw new Error("missing " + prefix);
  return out;
}
function write(name, b64) {
  writeFileSync(join(publicDir, name), Buffer.from(b64, "base64"));
  console.log("wrote", name, Buffer.from(b64, "base64").length);
}
write("mark.png", loadParts("mark"));
write("favicon-32.png", loadParts("favicon"));
write("og.jpg", loadParts("og"));
write("apple-touch-icon.png", loadParts("apple"));
write("pwa-192.png", loadParts("pwa192"));
