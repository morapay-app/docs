#!/usr/bin/env node
/**
 * Regenerate docs OpenAPI from morapay-app/core (production).
 *
 *   CORE_ROOT=/path/to/core node scripts/sync-openapi.mjs
 *
 * Defaults CORE_ROOT to ../../agent/repos/core when present.
 */
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const docsRoot = path.resolve(here, "..");
const defaultCore = path.resolve("/agent/repos/core");
const coreRoot = process.env.CORE_ROOT?.trim() || defaultCore;
const outFile = path.join(docsRoot, "openapi", "v2.openapi.json");

if (!existsSync(path.join(coreRoot, "scripts/gen-openapi.ts"))) {
  console.error(`CORE_ROOT missing gen-openapi.ts: ${coreRoot}`);
  process.exit(1);
}

console.log(`→ Generating OpenAPI in ${coreRoot}`);
const gen = spawnSync("pnpm", ["exec", "tsx", "scripts/gen-openapi.ts"], {
  cwd: coreRoot,
  stdio: "inherit",
});

if (gen.status !== 0) process.exit(gen.status ?? 1);

const src = path.join(coreRoot, "openapi", "v2.openapi.json");
if (!existsSync(src)) {
  console.error("gen-openapi did not produce openapi/v2.openapi.json");
  process.exit(1);
}

mkdirSync(path.dirname(outFile), { recursive: true });
copyFileSync(src, outFile);
console.log(`✓ Wrote ${outFile}`);