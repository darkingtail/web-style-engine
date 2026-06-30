# Phase 5: SSR and Hydration

[Back to roadmap](./ROADMAP.md)

## Goal

Support production-grade SSR workflows.

## Tasks

- [x] Hydrate existing style tags in DOM renderer.
- [x] Add request-scoped SSR registry examples.
- [x] Preserve extraction order.
- [x] Extract critical CSS.
- [x] Extract CSS vars, globals, keyframes, and font faces.
- [x] Add multi-instance SSR tests.
- [x] Reserve streaming SSR protocol.

## Progress

- SSR style tags now include rule id metadata for client hydration.
- DOM renderer hydration reuses existing style tags and avoids duplicate insertion for hydrated rule ids.
- Added `extractCriticalCSS`.
- Added `flushChunk()` streaming protocol on SSR renderers.
- Added tests for extraction order, vars, globals, keyframes, font faces, hydration dedupe, critical CSS, streaming chunks, and multi-instance SSR isolation.
- Added SSR and hydration docs with request-scoped examples.

## Acceptance

- SSR extraction and client hydration avoid duplicate style insertion.
- Multi-instance SSR examples are covered by tests.
