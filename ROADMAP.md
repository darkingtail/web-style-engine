# web-style-engine Roadmap

This is the main roadmap index for `web-style-engine`.

`web-style-engine` is a framework-agnostic enterprise-grade Web style engine. The style engine is the primary core. Responsive is one of the core capabilities, alongside renderers, CSS variables, tokens, framework adapters, SSR, and extensibility.

## Target Scenarios

- Marketing and official websites
- Product landing pages
- Documentation sites
- H5 and mobile Web
- WebView
- SSR and SSG
- Shadow DOM and iframe previews
- Low-code and visual editor previews
- Micro-frontends

## Current State

Implemented:

- Style engine core: `css`, `cx`, `keyframes`, `injectGlobal`, `vars`
- Global font-face injection with `fontFace`
- Registry, dedupe, stable class names, labels
- DOM / SSR / Noop / Mock renderers
- SSR extraction and style tag output
- Transformer hook
- H5 `px2rem` and `px2vw` transformers
- CSS variables helper and scoped vars injection
- Theme runtime protocol with scoped theme registration
- Token alias resolution, derivative token helpers, token diff helpers, and CSS var fallbacks
- Responsive module: breakpoints, media query helpers, media feature helpers, container query helpers, H5 helpers, responsive object output, observer
- Vue / React / Solid minimal adapters
- Astro docs site with Vue, React, responsive landing, and theme runtime examples

Partially implemented:

- CSS nesting and at-rule serialization
- CSS cascade layer support
- Specificity control
- Hydration hook
- RTL transformer
- Multi-instance isolation

Not yet implemented:

- Production-grade hydration
- Streaming SSR
- Prefixer plugin
- Atomic CSS mode
- Static extraction
- Low-code inspect APIs

## Phase Index

| Phase | Focus | Document |
| --- | --- | --- |
| 1 | Core Stabilization | [ROADMAP.PHASE.1.md](./ROADMAP.PHASE.1.md) |
| 2 | Responsive Completion | [ROADMAP.PHASE.2.md](./ROADMAP.PHASE.2.md) |
| 3 | Theme and Token System | [ROADMAP.PHASE.3.md](./ROADMAP.PHASE.3.md) |
| 4 | Framework Adapters | [ROADMAP.PHASE.4.md](./ROADMAP.PHASE.4.md) |
| 5 | SSR and Hydration | [ROADMAP.PHASE.5.md](./ROADMAP.PHASE.5.md) |
| 6 | Plugins and Compatibility | [ROADMAP.PHASE.6.md](./ROADMAP.PHASE.6.md) |
| 7 | Advanced Modes | [ROADMAP.PHASE.7.md](./ROADMAP.PHASE.7.md) |
| 8 | Ecosystem Migration | [ROADMAP.PHASE.8.md](./ROADMAP.PHASE.8.md) |

## Working Rules

- The core must remain framework-free.
- Responsive is a core capability, but not the only core.
- Design-system-specific tokens stay outside core.
- Prefer Web platform primitives.
- Do not optimize for non-Web platforms.
- Keep docs and examples close to real website scenarios.
- Prefer pnpm for package management.
