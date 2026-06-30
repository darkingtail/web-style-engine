# web-style-engine

A framework-agnostic enterprise-grade Web style engine.

`web-style-engine` supports the style runtime underneath enterprise component libraries, design systems, responsive official websites, and complex Web applications. It extracts the reusable style-engine layer from `antdv-style` and keeps framework adapters, runtime renderers, responsive helpers, token helpers, and design-system-specific integrations in upper-layer packages.

## Architecture

```txt
Style Engine Core
  -> DOM / SSR / Noop / Mock Renderer
  -> Responsive query / observer helpers
  -> createStylesCore
  -> Vue / React / Solid adapters
  ->
Design-system packages such as antdv-style
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
