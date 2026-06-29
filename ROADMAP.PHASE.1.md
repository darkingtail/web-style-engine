# Phase 1: Core Stabilization

[Back to roadmap](./ROADMAP.md)

## Goal

Make the style engine core reliable enough for real applications.

## Tasks

- [x] Add top-level `StyleEngineOptions` convenience fields:
  - `container`
  - `nonce`
  - `insertionPoint`
  - `layer`
  - `specificity`
- [x] Keep renderer-level options as the lower-level escape hatch.
- [x] Complete style serialization support:
  - declarations
  - nested selectors
  - `@media`
  - `@supports`
  - `@layer`
- [x] Add `fontFace`.
- [x] Strengthen `dispose` and `flush` tests.
- [ ] Add DOM renderer tests for:
  - ShadowRoot container
  - iframe-like document container
  - [x] nonce
  - [x] insertion point
- [x] Document core usage and renderer options.

## Progress

- Added top-level DOM renderer convenience options to `createStyleEngine`.
- Added default `layer` and `specificity` handling.
- Added `fontFace`.
- Improved nested selector and at-rule serialization.
- Added tests for responsive style output through `createStylesCore`, top-level DOM renderer options, and cleanup APIs.

## Acceptance

- `pnpm run typecheck`
- `pnpm run build`
- `pnpm test`
- `pnpm docs:build`
- Tests cover DOM, SSR, Noop, Mock, and renderer options.
