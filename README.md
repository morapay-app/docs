# @morapay/docs (Mintlify)

Developer documentation for the Morapay **v2** API (`docs.morapay.io`).

## Development

```bash
pnpm install
pnpm dev
```

Local preview: **http://localhost:3005** (`mint dev --port 3005`).

## OpenAPI

The API reference tab is generated from `openapi/v2.openapi.json`. Refresh from Core:

```bash
CORE_ROOT=/path/to/morapay-app/core pnpm sync-openapi
```

## Build

```bash
pnpm build
```

Exports static site to `out/` (see `vercel.json`).

## Layout

| Path | Contents |
|------|-----------|
| `getting-started/` | Quickstart, auth, environments |
| `concepts/` | Envelopes, payment links, payouts |
| `guides/` | End-to-end v2 flows |
| `api-reference/` | Overview + conventions (detail in OpenAPI) |
| `openapi/` | `v2.openapi.json` from Core |
| `reference/` | Coverage tables |
| `developer-tools/` | Webhooks, idempotency |
| `errors/` | Error handling + code pages |

## Publishing

Connect this repo in the [Mintlify dashboard](https://dashboard.mintlify.com) or deploy `out/` via Vercel.