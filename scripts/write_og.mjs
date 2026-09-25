#!/usr/bin/env node
import { writeFileSync, readFileSync, mkdirSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");
const scriptsDir = dirname(fileURLToPath(import.meta.url));
mkdirSync(publicDir, { recursive: true });

const p = join(scriptsDir, "og_full.b64");
if (!existsSync(p)) throw new Error("missing " + p);
const buf = Buffer.from(readFileSync(p, "utf8").replace(/\s+/g, ""), "base64");
writeFileSync(join(publicDir, "og.jpg"), buf);
writeFileSync(join(publicDir, "og.png"), buf);
console.log("wrote public/og.jpg and public/og.png", buf.length, "bytes");
