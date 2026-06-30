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
- SSR extraction, hydration metadata, critical CSS extraction, and streaming chunk protocol
- Transformer/plugin protocol with deterministic ordering and diagnostics
- H5 `px2rem` and `px2vw` transformers
- RTL transformer and focused prefixer plugin
- Explicit advanced modes: block/atomic runtime, static/hybrid extraction metadata, class inspection, serializable snapshots
- Ecosystem migration helpers for antdv-style boundary, token mapping, compatibility gates, release strategy, and API stability policy
- CSS variables helper and scoped vars injection
- Theme runtime protocol with scoped theme registration
- Token alias resolution, derivative token helpers, token diff helpers, and CSS var fallbacks
- Responsive module: breakpoints, media query helpers, media feature helpers, container query helpers, H5 helpers, responsive object output, observer
- Vue / React / Solid adapters with provider-style scopes, hook/composable style helpers, reactive theme sources, and responsive external-store bridge
- Astro docs site with Vue, React, responsive landing, theme runtime, SSR/hydration, advanced modes, and migration policy docs

Partially implemented:

- CSS nesting and at-rule serialization
- CSS cascade layer support
- Specificity control
- Multi-instance isolation

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
