#!/usr/bin/env node
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
const dir = dirname(fileURLToPath(import.meta.url));
const root = join(dir, "..");
mkdirSync(join(root, "public"), { recursive: true });
const names = ["favicon-32.png", "apple-touch-icon.png", "pwa-192.png", "mark.png", "pwa-512.png"];
for (const name of names) {
  let b64 = "";
  const single = join(dir, name + ".b64");
  if (existsSync(single)) {
    b64 = readFileSync(single, "utf8").trim();
  } else {
    for (let i = 0; i < 40; i++) {
      const p = join(dir, name + ".b64.p" + i);
      if (!existsSync(p)) break;
      b64 += readFileSync(p, "utf8").trim();
    }
  }
  if (!b64) {
    console.warn("missing", name);
    continue;
  }
  writeFileSync(join(root, "public", name), Buffer.from(b64, "base64"));
  console.log("wrote", name, b64.length);
}
