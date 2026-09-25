#!/usr/bin/env node
import { writeFileSync, readFileSync, mkdirSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");
const scriptsDir = dirname(fileURLToPath(import.meta.url));
mkdirSync(publicDir, { recursive: true });

const partNames = ["og_full.p0.b64", "og_full.p1.b64", "og_full.p2.b64", "og_full.p3.b64", "og_full.p4.b64", "og_full.p5.b64", "og_full.p6.b64"];
const parts = partNames.map((f) => {
  const p = join(scriptsDir, f);
  if (!existsSync(p)) throw new Error("missing " + p);
  return readFileSync(p, "utf8").replace(/\s+/g, "");
});
const buf = Buffer.from(parts.join(""), "base64");
writeFileSync(join(publicDir, "og.jpg"), buf);
writeFileSync(join(publicDir, "og.png"), buf);
console.log("wrote public/og.jpg and public/og.png", buf.length, "bytes");
