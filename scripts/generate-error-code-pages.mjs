#!/usr/bin/env node
/**
 * Generate docs/errors/codes/*.mdx from sdk/src/errors/catalog.json
 * Run: node docs/scripts/generate-error-code-pages.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { toCodeKey } from "../../sdk/scripts/generate-error-codes.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "../..");
const catalogPath = join(repoRoot, "sdk/src/errors/catalog.json");
const outDir = join(repoRoot, "docs/errors/codes");

const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));

const HTTP_STATUS = {
  "auth.unauthorized": 401,
  "auth.forbidden": 403,
  "auth.keys.invalid": 401,
  "auth.keys.revoked": 401,
  "auth.keys.expired": 401,
  "auth.keys.legacy_unsupported": 401,
  "auth.keys.secret_in_header": 401,
  "auth.keys.origin_not_allowed": 403,
  "auth.signature.mismatch": 401,
  "auth.signature.timestamp_expired": 401,
  "auth.signature.incomplete": 401,
  "auth.signature.missing": 401,
  "auth.signature.invalid_timestamp": 401,
  "auth.signature.invalid_format": 401,
  "kyb.forbidden": 403,
  "kyb.blocked": 403,
  "links.amount.below_minimum": 422,
  "links.slug.duplicate": 409,
  "payouts.momo.insufficient_balance": 400,
  "payouts.network.carrier_down": 503,
  "payouts.clearing.refund_failed": 500,
  "crypto.chain.unsupported": 422,
  "crypto.slippage.exceeded": 422,
  "api.rate_limited": 429,
  "api.service_unavailable": 503,
  "api.proxy.core_unconfigured": 503,
  "api.proxy.signing_unconfigured": 503,
  "api.proxy.core_unreachable": 502,
  "api.connection_failed": 502,
  "api.internal_error": 500,
  "api.bad_gateway": 502,
  "api.gateway_timeout": 504,
  "resource.not_found": 404,
  "resource.conflict": 409,
  "request.invalid": 400,
  "request.validation_failed": 422,
};

const HTTP_LABELS = {
  400: "400 Bad Request",
  401: "401 Unauthorized",
  403: "403 Forbidden",
  404: "404 Not Found",
  409: "409 Conflict",
  422: "422 Unprocessable Entity",
  429: "429 Too Many Requests",
  500: "500 Internal Server Error",
  502: "502 Bad Gateway",
  503: "503 Service Unavailable",
  504: "504 Gateway Timeout",
};

function slug(code) {
  return code.replace(/\./g, "-").replace(/_/g, "-");
}

function docPath(code) {
  return `/errors/codes/${slug(code)}`;
}

function resolveUiHint(code, status, entry) {
  if (entry.uiHint) return entry.uiHint;
  const defaults = catalog.uiHintDefaults ?? {};
  const prefixes = Object.keys(defaults).sort((a, b) => b.length - a.length);
  for (const prefix of prefixes) {
    if (code === prefix || code.startsWith(`${prefix}.`)) {
      return defaults[prefix];
    }
  }
  return catalog.statusUiHints?.[String(status)] ?? { severity: "info", placement: "toast" };
}

function relatedCodes(code) {
  const domain = code.split(".")[0];
  return Object.keys(allEntries)
    .filter((c) => c !== code && c.startsWith(`${domain}.`))
    .slice(0, 4);
}

function whatHappened(code, entry) {
  if (code.startsWith("auth.")) {
    return "The API rejected the request during authentication before your route handler ran.";
  }
  if (code.startsWith("links.")) {
    return "The API rejected a payment link or checkout link create/update request.";
  }
  if (code.startsWith("payouts.")) {
    return "The API could not complete a payout, disbursement, or treasury operation.";
  }
  if (code.startsWith("kyb.")) {
    return "The API blocked the action because of your business KYB state or permissions.";
  }
  if (code.startsWith("crypto.")) {
    return "The API rejected a crypto quote or checkout request for the selected network or slippage settings.";
  }
  if (code.startsWith("resource.")) {
    return "The API could not find or reconcile the resource referenced in your request.";
  }
  if (code.startsWith("request.")) {
    return "The API understood the request but rejected the payload or business rules.";
  }
  if (code.startsWith("api.")) {
    return "The Morapay API could not complete the request due to rate limits, connectivity, or infrastructure.";
  }
  return entry.why.split(".")[0] + ".";
}

function sdkClass(code, status) {
  if (status === 401 || code.startsWith("auth.")) return "MorapayAuthenticationError";
  if (status === 403 || code.startsWith("kyb.")) return "MorapayPermissionError";
  if (status === 404 || code === "resource.not_found") return "MorapayNotFoundError";
  if (status === 409 || code === "resource.conflict") return "MorapayConflictError";
  if (status === 429 || code === "api.rate_limited") return "MorapayRateLimitError";
  if (status >= 500) return "MorapayApiError";
  if (status === 400 || status === 422 || code.startsWith("request.")) return "MorapayInvalidRequestError";
  return "MorapayApiError";
}

function renderPage(code, entry) {
  const status = HTTP_STATUS[code] ?? 400;
  const http = HTTP_LABELS[status] ?? `${status}`;
  const ui = resolveUiHint(code, status, entry);
  const displayBlock = entry.displayMessage
    ? `\n## Display message\n\n> ${entry.displayMessage}\n\nUse \`err.displayMessage\` in UI components. Reserve \`err.message\` for server logs.\n`
    : "";
  const related = relatedCodes(code);
  const relatedBlock =
    related.length > 0
      ? `\n## Related codes\n\n${related.map((c) => `- [\`${c}\`](${docPath(c)})`).join("\n")}\n`
      : `\n## Related\n\n- [Error handling](/errors/error-handling)\n- [Conventions](/api-reference/conventions)\n`;

  const ErrorClass = sdkClass(code, status);
  const codeConst = toCodeKey(code);

  return `---
title: "${code}"
description: "${entry.safeMessage.replace(/"/g, '\\"')}"
---

**Code:** \`${code}\`  
**HTTP:** \`${http}\`

## What happened

${whatHappened(code, entry)}

## Safe message

> ${entry.safeMessage}

Use \`err.safeMessage\` or \`err.displayMessage\` in customer UI, not \`err.message\`.
${displayBlock}
## Why this happened

${entry.why}

## How to fix it

${entry.howToFix}

## UI hint

| Field | Value |
|-------|-------|
| \`severity\` | \`${ui.severity}\` |
| \`placement\` | \`${ui.placement}\` |
${ui.actionText ? `| \`actionText\` | \`${ui.actionText}\` |` : ""}

## Programmatic handling

\`\`\`typescript
import { ${ErrorClass}, isMorapayError, MorapayErrorCode } from "@morapay/sdk";

catch (err) {
  if (isMorapayError(err) && err.code === MorapayErrorCode.${codeConst}) {
    console.error(err.format());
    // Customer UI: err.displayMessage ?? err.safeMessage
    // Support: err.requestId
  }
}
\`\`\`
${relatedBlock}`;
}

// Merge catalog entries + status-only codes not duplicated
const allEntries = { ...catalog.entries };

if (!allEntries["auth.forbidden"] && catalog.statusGuides?.["403"]) {
  allEntries["auth.forbidden"] = catalog.statusGuides["403"];
}
if (!allEntries["api.bad_gateway"] && catalog.statusFallbackCodes?.["502"]) {
  allEntries["api.bad_gateway"] = {
    safeMessage: "Our payment service is temporarily unavailable. Please try again shortly.",
    why: "The Morapay API received an invalid response from an upstream service.",
    howToFix: "Retry with exponential backoff. Contact support with requestId if it persists.",
  };
}
if (!allEntries["api.gateway_timeout"] && catalog.statusFallbackCodes?.["504"]) {
  allEntries["api.gateway_timeout"] = {
    safeMessage: "Our payment service is temporarily unavailable. Please try again shortly.",
    why: "The Morapay API timed out waiting for an upstream service.",
    howToFix: "Retry with backoff. Reduce payload size or split batch operations if applicable.",
  };
}

mkdirSync(outDir, { recursive: true });

const codes = Object.keys(allEntries).sort();
const pages = codes.map((code) => slug(code));

for (const code of codes) {
  const file = join(outDir, `${slug(code)}.mdx`);
  writeFileSync(file, renderPage(code, allEntries[code]), "utf8");
}

const navGroups = [
  {
    group: "Authentication",
    pages: codes.filter((c) => c.startsWith("auth.")).map(slug),
  },
  {
    group: "KYB & permissions",
    pages: codes.filter((c) => c.startsWith("kyb.")).map(slug),
  },
  {
    group: "Payment links",
    pages: codes.filter((c) => c.startsWith("links.")).map(slug),
  },
  {
    group: "Payouts & treasury",
    pages: codes.filter((c) => c.startsWith("payouts.")).map(slug),
  },
  {
    group: "Crypto checkout",
    pages: codes.filter((c) => c.startsWith("crypto.")).map(slug),
  },
  {
    group: "Resources & validation",
    pages: codes.filter((c) => c.startsWith("resource.") || c.startsWith("request.")).map(slug),
  },
  {
    group: "Platform & connectivity",
    pages: codes.filter((c) => c.startsWith("api.")).map(slug),
  },
];

const navJsonPath = join(outDir, "_nav.json");
writeFileSync(
  navJsonPath,
  JSON.stringify({ pages, navGroups, generatedAt: new Date().toISOString() }, null, 2),
  "utf8"
);

console.log(`Wrote ${codes.length} error code pages to ${outDir}`);
