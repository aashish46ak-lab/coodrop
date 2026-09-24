#!/usr/bin/env node
import { spawnSync } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
const dir = dirname(fileURLToPath(import.meta.url));
for (const s of [
  "write_og.mjs",
  "write_pwa192.mjs",
  "write_pwa512.mjs",
  "write_logo.mjs",
  "write_logo_transparent.mjs",
  "write_mark.mjs",
  "write_favicon32.mjs",
  "write_apple.mjs",
]) {
  const r = spawnSync(process.execPath, [join(dir, s)], { stdio: "inherit" });
  if (r.status) process.exit(r.status || 1);
}
