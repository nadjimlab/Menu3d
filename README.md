# DigiMenu 3D

DigiMenu is an immersive digital menu experience for restaurants and cafés. It combines a cinematic product discovery flow with interactive 3D/AR previews, product customization, a cart and order-confirmation flow, and a lightweight kitchen and manager dashboard.

The current application is a client-side prototype powered by mock catalog, store, and order data. It is designed as a polished foundation for a production menu system; persistence, authentication, payment processing, and server-side order delivery are intentionally outside the current scope.

## Highlights

| Capability | Description |
| --- | --- |
| Product discovery | Browse categories and move through a focused, vertical product experience. |
| 3D and AR | Open supported products in an interactive `<model-viewer>` experience with WebXR, Scene Viewer, and Quick Look modes where available. |
| Customization | Choose product options, add notes, and calculate option-based prices before adding an item to the cart. |
| Ordering flow | Manage quantities, choose dine-in or takeaway, select a payment method, and receive a live order confirmation view. |
| Manager dashboard | Review mock kitchen orders, update statuses, adjust product availability and prices, and edit store information. |
| Arabic-first UI | Arabic RTL is the default, with an English toggle and synchronized document language and direction. |

## Tech stack

The project uses React 19, TypeScript, Vite, Tailwind CSS 4, Motion, and Lucide React. Product and store data are currently defined in `src/data/mockData.ts`, while reusable interface sections live under `src/components/`.

## Requirements

Use **Node.js 24** for CI and local development. Node.js 22 or newer is supported by the project engine constraint. The repository standardizes on npm and commits `package-lock.json` so that local and CI installations are reproducible.

## Getting started

```bash
git clone https://github.com/nadjimlab/Menu3d.git
cd Menu3d
npm ci
npm run dev
```

Open `http://localhost:3000` in a browser. The app does not require a local API or a secret for its current mock-data experience.

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
│   ├── components/            # Product, cart, order, dashboard, and 3D UI
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

## Data and external services

The demo catalog references remote Unsplash images and public sample GLB/USDZ models from `modelviewer.dev`. These resources are suitable for demonstration only. Before production use, replace them with licensed, versioned assets and connect the order flow to a protected backend.

## Production roadmap

A production deployment should add authenticated staff access, a server-side catalog and order store, real-time kitchen updates, input validation at the API boundary, payment-provider integration, rate limiting, and a privacy policy covering customer contact data. The current dashboard is a local demo state and should not be treated as an access-control boundary.

## License

This project is distributed under the MIT License. See [`LICENSE`](./LICENSE).
