# Contributing to DigiMenu

Thank you for improving DigiMenu. Keep changes focused, preserve the Arabic-first responsive experience, and explain user-visible behavior in the pull request description.

## Local checks

Before opening a pull request, install dependencies with `npm ci`, then run the following commands:

```bash
npm run typecheck
npm run build
```

If a change affects the interface, also verify the main discovery, product details, cart, order confirmation, and dashboard flows in a browser at mobile and desktop widths.

## Pull requests

Use a clear imperative title, describe the reason for the change, and include screenshots or a short verification note for visual changes. Do not commit `.env` files, generated `dist/` output, `node_modules/`, or credentials.
