#!/usr/bin/env node
import { spawnSync } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
const dir = dirname(fileURLToPath(import.meta.url));
for (const script of ["write_icons.mjs", "write_og.mjs"]) {
  const r = spawnSync(process.execPath, [join(dir, script)], { stdio: "inherit" });
  if (r.status) process.exit(r.status || 1);
}
