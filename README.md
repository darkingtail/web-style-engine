# web-style-engine

A framework-agnostic style engine for Web UI.

This package extracts the reusable style-engine layer from `antdv-style` and keeps framework adapters, runtime renderers, responsive helpers, token helpers, and design-system integrations separated.

## Architecture

```txt
Style Engine Core
  ↓
DOM / SSR / Noop / Mock Renderer
  ↓
Responsive query / observer helpers
  ↓
createStylesCore
  ↓
Vue / React / Solid adapters
  ↓
Design-system adapters such as antdv-style
```

Responsive utilities are available from both the root entry and the `web-style-engine/responsive` subpath:

```ts
import { createResponsive } from 'web-style-engine/responsive'

const responsive = createResponsive({
  breakpoints: {
    mobile: 0,
    tablet: 768,
    desktop: 1280,
  },
})
```


See `docs/` for the design notes and `docs-site/` for the Astro Starlight documentation site scaffold.
