# Phase 8: Ecosystem Migration

[Back to roadmap](./ROADMAP.md)

## Goal

Support migration from `antdv-style` and future design-system adapters.

## Tasks

- [x] Define antdv-style integration boundary.
- [x] Add antdv token mapping adapter outside core.
- [x] Add migration guide.
- [x] Add compatibility tests.
- [x] Define release strategy.
- [x] Define API stability policy.

## Progress

- Added antdv migration boundary helpers under `web-style-engine/migration`.
- Added `createAntdvTokenAdapter` and `applyAntdvThemeToEngine`.
- Added explicit antdv-style compatibility gate.
- Added release strategy and API stability policy helpers.
- Added compatibility tests for Emotion wrapping, token mapping, CSS variable injection, release policy, and API policy.
- Expanded migration documentation and release/API policy documentation.

## Acceptance

- `antdv-style` can consume `web-style-engine` without moving antdv-specific logic into core.
- Migration path is documented.
