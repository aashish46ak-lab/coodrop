#!/usr/bin/env node
import { writeFileSync, mkdirSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
const dir = dirname(fileURLToPath(import.meta.url));
const root = join(dir, "..");
mkdirSync(join(root, "public"), { recursive: true });
const b64 = readFileSync(join(dir, "og.jpg.b64"), "utf8").trim();
const buf = Buffer.from(b64, "base64");
writeFileSync(join(root, "public/og.jpg"), buf);
writeFileSync(join(root, "public/og.png"), buf);
console.log("wrote public/og.jpg and public/og.png", buf.length);
