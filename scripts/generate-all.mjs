#!/usr/bin/env node
/**
 * Regenerate all docs artifacts in one run:
 *   - SDK error code dictionary (sdk/src/errors/codes.ts)
 *   - Error code MDX pages (docs/errors/codes/*.mdx)
 *   - Coverage JSON export (requires DATABASE_URL in core/.env)
 *   - Reference MDX pages from coverage (docs/reference/*.mdx)
 *
 *   cd morapay-web/apps/docs && pnpm generate
 *
 * Flags:
 *   --skip-coverage   Skip DB export; regenerate MDX from existing coverage.json only
 *   --seed            Seed reference data before coverage export
 */

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const docsRoot = path.resolve(here, "..");
const morapayWebRoot = path.resolve(docsRoot, "..", "..");
const workspaceRoot = path.resolve(morapayWebRoot, "..");
const coreRoot = path.join(workspaceRoot, "core");
const coverageJson = path.join(docsRoot, "data/coverage.json");

const skipCoverage = process.argv.includes("--skip-coverage");
const withSeed = process.argv.includes("--seed");

function run(label, cmd, args, cwd) {
  console.log(`\n→ ${label}`);
  const result = spawnSync(cmd, args, {
    cwd,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function tryRun(label, cmd, args, cwd) {
  console.log(`\n→ ${label}`);
  const result = spawnSync(cmd, args, {
    cwd,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  return result.status ?? 1;
}

run("SDK error codes", "node", ["sdk/scripts/generate-error-codes.mjs"], workspaceRoot);
run(
  "Error code MDX pages",
  "node",
  ["morapay-web/apps/docs/scripts/generate-error-code-pages.mjs"],
  workspaceRoot
);

if (!skipCoverage) {
  const exportArgs = [
    "exec",
    "tsx",
    "scripts/export-docs-coverage.ts",
    "--out",
    coverageJson,
  ];
  if (withSeed) {
    exportArgs.push("--seed");
  }

  const exportStatus = tryRun("Coverage JSON export", "pnpm", exportArgs, coreRoot);
  if (exportStatus !== 0) {
    if (existsSync(coverageJson)) {
      console.warn("\n⚠ Coverage export failed; continuing with existing coverage.json.");
    } else {
      console.error("\n✗ Coverage export failed and no existing coverage.json.");
      process.exit(exportStatus);
    }
  }
} else {
  console.log("\n→ Skipping coverage export (--skip-coverage)");
}

if (existsSync(coverageJson)) {
  run("Coverage reference MDX", "pnpm", ["exec", "tsx", "scripts/generate-docs-coverage-mdx.ts"], coreRoot);
} else {
  console.warn("\n⚠ No coverage.json; skipped reference MDX generation.");
}

console.log("\n✓ Docs generation complete.");
