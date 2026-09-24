#!/usr/bin/env node
import { spawnSync } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
const dir = dirname(fileURLToPath(import.meta.url));
for (const s of ["write_og_both.mjs", "write_icons.mjs"]) {
  const r = spawnSync(process.execPath, [join(dir, s)], { stdio: "inherit" });
  if (r.status) process.exit(r.status || 1);
}
