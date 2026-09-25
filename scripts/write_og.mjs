#!/usr/bin/env node
import { writeFileSync, readFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");
const scriptsDir = dirname(fileURLToPath(import.meta.url));
mkdirSync(publicDir, { recursive: true });

const parts = ["og_p0.b64", "og_p1.b64", "og_p2.b64"].map((f) =>
  readFileSync(join(scriptsDir, f), "utf8").replace(/\s+/g, "")
);
const buf = Buffer.from(parts.join(""), "base64");
writeFileSync(join(publicDir, "og.jpg"), buf);
writeFileSync(join(publicDir, "og.png"), buf);
console.log("wrote public/og.jpg and public/og.png", buf.length, "bytes");
