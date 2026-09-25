#!/usr/bin/env node
import { writeFileSync, readFileSync, mkdirSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");
const scriptsDir = dirname(fileURLToPath(import.meta.url));
mkdirSync(publicDir, { recursive: true });

const partNames = ["og_p0.b64", "og_p1.b64", "og_p2.b64", "og_p3.b64", "og_p4.b64", "og_p5.b64", "og_p6.b64", "og_p7.b64", "og_p8.b64", "og_p9.b64", "og_p10.b64", "og_p11.b64"];
const parts = partNames.map((f) => {
  const p = join(scriptsDir, f);
  if (!existsSync(p)) throw new Error("missing " + p);
  return readFileSync(p, "utf8").replace(/\s+/g, "");
});
const buf = Buffer.from(parts.join(""), "base64");
writeFileSync(join(publicDir, "og.jpg"), buf);
writeFileSync(join(publicDir, "og.png"), buf);
console.log("wrote public/og.jpg and public/og.png", buf.length, "bytes");
