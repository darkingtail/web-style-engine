# Phase 1: Core Stabilization

[Back to roadmap](./ROADMAP.md)

## Goal

Make the style engine core reliable enough for real applications.

## Tasks

- Add top-level `StyleEngineOptions` convenience fields:
  - `container`
  - `nonce`
  - `insertionPoint`
  - `layer`
  - `specificity`
- Keep renderer-level options as the lower-level escape hatch.
- Complete style serialization support:
  - declarations
  - nested selectors
  - `@media`
  - `@supports`
  - `@layer`
- Add `fontFace`.
- Strengthen `dispose` and `flush` tests.
- Add DOM renderer tests for:
  - ShadowRoot container
  - iframe-like document container
  - nonce
  - insertion point
- Document core usage and renderer options.

## Acceptance

- `pnpm run typecheck`
- `pnpm run build`
- `pnpm test`
- `pnpm docs:build`
- Tests cover DOM, SSR, Noop, Mock, and renderer options.

