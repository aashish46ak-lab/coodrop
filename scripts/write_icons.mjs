#!/usr/bin/env node
import { writeFileSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));
const pub = join(dir, "..", "public");
const partsDir = join(dir, "icon_parts");
mkdirSync(pub, { recursive: true });

const files = {};
try {
  for (const name of readdirSync(partsDir)) {
    if (!name.endsWith(".b64")) continue;
    const base = name.replace(/\.\d+\.b64$/, "");
    const idx = Number(name.match(/\.(\d+)\.b64$/)[1]);
    if (!files[base]) files[base] = [];
    files[base][idx] = readFileSync(join(partsDir, name), "utf8");
  }
} catch (e) {
  console.warn("icon_parts missing, skip", e.message);
  process.exit(0);
}
for (const [name, chunks] of Object.entries(files)) {
  const b64 = chunks.join("");
  writeFileSync(join(pub, name), Buffer.from(b64, "base64"));
  console.log("wrote", name, Buffer.from(b64, "base64").length);
}
console.log("Brand icons ready.");
