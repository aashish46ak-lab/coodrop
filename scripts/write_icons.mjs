#!/usr/bin/env node
import { writeFileSync, mkdirSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
const dir = dirname(fileURLToPath(import.meta.url));
const root = join(dir, "..");
mkdirSync(join(root, "public"), { recursive: true });
const names = ["favicon-32.png", "apple-touch-icon.png", "pwa-192.png", "mark.png", "pwa-512.png"];
for (const name of names) {
  const b64 = readFileSync(join(dir, name + ".b64"), "utf8").trim();
  writeFileSync(join(root, "public", name), Buffer.from(b64, "base64"));
  console.log("wrote", name);
}
