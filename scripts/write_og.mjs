#!/usr/bin/env node
import { writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");
mkdirSync(publicDir, { recursive: true });
const b64 = `PLACEHOLDER_WILL_REPLACE`;
writeFileSync(join(publicDir, "og.jpg"), Buffer.from(b64, "base64"));
console.log("wrote public/og.jpg");
