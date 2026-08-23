# Showly — Interactive Product Experience

Showly is an Arabic-first, multilingual QR storefront platform for presenting products and services across restaurants, cafés, bakeries, retail, fashion, beauty, furniture, electronics, and service businesses. It combines premium visual presentation, product details, direct WhatsApp contact, shareable store links, and a multi-tenant workspace foundation.

The current public experience is a polished frontend MVP powered by local demo data. It is intentionally structured so the mock tenant layer can later be replaced with authenticated APIs, a database, object storage, and subscription billing without rebuilding the customer experience.

## Highlights

| Capability | Description |
| --- | --- |
| Multi-tenant storefronts | Present several independent stores with their own slug, identity, industry, city, links, and metrics. |
| Interactive product presentation | Display large product photography, details, availability, specifications, saving, sharing, and mobile-first product cards. |
| Direct conversion | Contact a store or a specific product on WhatsApp with a pre-filled enquiry message. |
| Multilingual experience | Arabic RTL, Français, and English copy with synchronized language and direction. |
| Persistent QR storefronts | Generate one QR per store; the destination stays stable while the catalog can be updated later. |
| Admin workspace | Manage stores, catalog visibility, QR distribution, links, and baseline engagement signals from a responsive dashboard. |
| Mobile-first performance | Lightweight UI, lazy-loaded product images, compact interaction patterns, and no unnecessary AI or heavy media runtime. |

## Tech stack

The project uses React 19, TypeScript, Vite, Tailwind CSS 4, Motion, Lucide React, and `qrcode.react`. Tenant and catalog demo data live in `src/data/mockData.ts`, while the public platform, storefront, QR, and admin experiences are modularized under `src/components/`.

## Requirements

Use **Node.js 24** for CI and local development. Node.js 22 or newer is supported by the project engine constraint. The repository standardizes on npm and commits `package-lock.json` so that local and CI installations are reproducible.

## Getting started

```bash
git clone https://github.com/nadjimlab/showly.git
cd showly
npm ci
npm run dev
```

Open `http://localhost:3000/` for the Showly landing page, `http://localhost:3000/?store=maison-du-delice` for the live demo storefront, or `http://localhost:3000/admin` for the workspace. The current MVP does not require an API key or local backend.

## Available commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server on port 3000. |
| `npm run typecheck` | Run the TypeScript compiler without emitting files. |
| `npm run lint` | Compatibility alias for the type-check command. |
| `npm run build` | Generate the optimized production bundle in `dist/`. |
| `npm run preview` | Serve the production bundle locally for final verification. |
| `npm run clean` | Remove generated build output. |

## Project structure

```text
.
├── .github/workflows/ci.yml  # Node 24 CI: install, type-check, build
├── public/                    # Small public web assets and metadata
├── src/
│   ├── components/            # Landing, storefront, product, QR, and admin UI
│   ├── data/                  # Mock catalog, store, and order data
│   ├── utils/                 # Shared browser utilities
│   ├── App.tsx                # Application state and screen flow
│   ├── index.css              # Global styles and visual tokens
│   ├── main.tsx               # React entry point
│   └── types.ts               # Shared domain types
├── index.html
├── package.json
└── package-lock.json
```

## Continuous integration

Every push to `main` or `master`, every pull request targeting those branches, and every manual dispatch runs the workflow in `.github/workflows/ci.yml`. The workflow uses read-only repository permissions, cancels obsolete runs, installs with `npm ci`, runs `npm run typecheck`, builds the production bundle, and verifies that `dist/index.html` exists.

## Deployment

The production site is deployed automatically to [GitHub Pages](https://nadjimlab.github.io/showly/) whenever a change is pushed to `main`. The public Showly landing page is available at the root, demo tenants use `?store=<slug>` or `/s/<slug>`, and the workspace is available at `/admin`. GitHub Pages hosts the frontend MVP; production multi-tenant data and authentication should move to a backend before commercial launch.

## Data and external services

The demo catalog references remote Unsplash images. These resources are suitable for demonstration only; before production use, replace them with licensed, versioned assets and connect the order flow to a protected backend.

## Production roadmap

The next production steps are authenticated staff access, server-side tenant isolation, catalog and media storage, custom domains, WhatsApp event tracking, billing, audit logs, rate limiting, input validation, privacy controls, and role-based permissions. The current admin route is a product preview, not a security boundary.

## License

This project is distributed under the MIT License. See [`LICENSE`](./LICENSE).
