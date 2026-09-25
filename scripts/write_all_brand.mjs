#!/usr/bin/env node
import { spawnSync } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
const dir = dirname(fileURLToPath(import.meta.url));
const r = spawnSync(process.execPath, [join(dir, "write_icons.mjs")], { stdio: "inherit" });
if (r.status) process.exit(r.status || 1);
