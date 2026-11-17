#!/usr/bin/env node
/**
 * Drop merchant-hidden v2 routes from the bundled OpenAPI document.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const target = path.join(here, "..", "openapi", "v2.openapi.json");

const HIDDEN_PREFIXES = [
  "/v2/batches",
  "/v2/claims",
  "/v2/requests",
  "/v2/plans",
  "/v2/subscriptions",
  "/v2/public/claims/",
  "/v2/public/plans/",
  "/v2/public/subscriptions/",
];

const HIDDEN_TAGS = new Set([
  "batches",
  "merchant_claims",
  "merchant_plans",
  "merchant_subscriptions",
  "requests",
  "claims",
]);

const doc = JSON.parse(readFileSync(target, "utf8"));

const paths = {};
for (const [route, value] of Object.entries(doc.paths ?? {})) {
  if (HIDDEN_PREFIXES.some((p) => route === p || route.startsWith(p))) continue;
  paths[route] = value;
}
doc.paths = paths;

if (Array.isArray(doc.tags)) {
  doc.tags = doc.tags.filter((t) => !HIDDEN_TAGS.has(t.name));
}

writeFileSync(target, `${JSON.stringify(doc, null, 2)}\n`);
console.log(`Filtered OpenAPI → ${Object.keys(paths).length} paths`);