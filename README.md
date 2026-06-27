# web-style-engine

A framework-agnostic style engine for Web UI.

This package extracts the reusable style-engine layer from `antdv-style` and keeps framework adapters, runtime renderers, token helpers, and design-system integrations separated.

## Architecture

```txt
Style Engine Core
  ↓
DOM / SSR / Noop / Mock Renderer
  ↓
createStylesCore
  ↓
Vue / React / Solid adapters
  ↓
Design-system adapters such as antdv-style
```

See `docs/` for the design notes and `docs-site/` for the Astro Starlight documentation site scaffold.
