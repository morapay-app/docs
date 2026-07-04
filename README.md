# Morapay documentation (Mintlify)

Developer documentation for the Morapay Merchant API and SDK.

## Development

Install the [Mintlify CLI](https://www.npmjs.com/package/mint):

```bash
npm i -g mint
```

Preview locally from this directory (where `docs.json` lives):

```bash
mint dev
```

Open [http://localhost:3000](http://localhost:3000).

If the dev server misbehaves, update the CLI:

```bash
mint update
```

## AI-assisted writing

Install Mintlify's documentation skill for Cursor and other AI tools:

```bash
npx skills add https://mintlify.com/docs
```

## Structure

```
docs/
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

Navigation uses **tabs** at the root (`Guides`, `API reference`, `Coverage`) — required for the Mint theme sidebar and top tab bar.

## Publishing

Connect the repo via the [Mintlify dashboard](https://dashboard.mintlify.com/settings/organization/github-app). Pushes to the default branch deploy automatically.

## Assets

Add `logo/light.svg`, `logo/dark.svg`, and `favicon.svg` under `docs/` (or point `docs.json` at CDN URLs).
