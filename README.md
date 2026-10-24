# @morapay/docs (Mintlify)

Developer documentation for the Morapay Merchant API and SDK (`docs.morapay.io`).

Content originated in [morapay-app/docs](https://github.com/morapay-app/docs); **this folder is the working copy** inside the `morapay-web` monorepo.

## Development

From the monorepo root:

```bash
pnpm install --filter @morapay/docs...
pnpm dev:docs
```

Or from this directory:

```bash
pnpm dev
```

Opens Mintlify on port **3005** (`mint dev --port 3005`).

Global CLI (optional): `npm i -g mint` then `mint dev` from this directory.

## Build (Vercel / static export)

```bash
pnpm build
```

Runs `mint export` → `out/` (see `vercel.json`).

## Structure

```
apps/docs/
├── docs.json                 # Site config (navigation tabs, branding)
├── favicon.png
├── logo/
├── getting-started/
├── concepts/
├── api-reference/            # REST endpoint docs
├── reference/                # Coverage reference tables
├── frontend-ui/
├── developer-tools/
├── errors/
└── support/
```

Navigation uses **tabs** at the root (`Guides`, `API reference`, `Coverage`).

## AI-assisted writing

```bash
npx skills add https://mintlify.com/docs
```

## Publishing

- **Vercel:** project root `apps/docs`, framework **Other**, output `out/`.
- **Mintlify Cloud:** connect the GitHub repo via the [Mintlify dashboard](https://dashboard.mintlify.com/settings/organization/github-app).
