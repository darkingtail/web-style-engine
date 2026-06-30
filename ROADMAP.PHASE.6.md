# Phase 6: Plugins and Compatibility

[Back to roadmap](./ROADMAP.md)

## Goal

Make transformations and browser compatibility extensible.

## Tasks

- [x] Formalize transformer/plugin protocol.
- [x] Improve `rtlTransformer`.
- [x] Add `prefixer` plugin.
- [x] Improve `px2rem`.
- [x] Add `px2vw`.
- [x] Add plugin order tests.
- [x] Add debug diagnostics for transformed output.

## Progress

- Added object-style `StylePlugin` protocol with `name`, `order`, and `transform`.
- Kept function transformer compatibility.
- Added deterministic plugin ordering with tie preservation.
- Added `prefixer`.
- Improved `rtlTransformer`, `px2rem`, and `px2vw`.
- Added transform diagnostics through `getDiagnostics()` and `clearDiagnostics()`.
- Added tests for ordering, diagnostics, prefixing, RTL, and px conversion filters.

## Acceptance

- Plugin ordering is deterministic.
- Transformers are documented and tested.
