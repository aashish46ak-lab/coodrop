#!/usr/bin/env node
import { writeFileSync, readFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");
mkdirSync(publicDir, { recursive: true });

const b64Path = join(dirname(fileURLToPath(import.meta.url)), "og.jpg.b64");
const b64 = readFileSync(b64Path, "utf8").replace(/\s+/g, "");
const buf = Buffer.from(b64, "base64");
writeFileSync(join(publicDir, "og.jpg"), buf);
writeFileSync(join(publicDir, "og.png"), buf);
console.log("wrote public/og.jpg and public/og.png", buf.length, "bytes");
