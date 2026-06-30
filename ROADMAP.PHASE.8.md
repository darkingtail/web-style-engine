# Phase 8: Ecosystem Boundary

[Back to roadmap](./ROADMAP.md)

## Goal

Define how upper-layer design-system packages consume `web-style-engine` without shipping design-system-specific migration code in the engine package.

## Tasks

- [x] Define the design-system integration boundary.
- [x] Keep antd-style and antdv-style migration helpers out of the engine runtime.
- [x] Document that migrations belong in upper-layer ecosystem packages.
- [x] Define release strategy.
- [x] Define API stability policy.

## Progress

- Removed antdv-style-specific migration helpers from the engine package boundary.
- Removed the `web-style-engine/migration` public export.
- Kept release strategy and API stability policy as documentation rather than runtime API.
- Documented that `antd-style`, `antdv-style`, and other ecosystem packages should implement their own migration adapters on top of the engine public APIs.

## Acceptance

- `web-style-engine` remains framework-agnostic and design-system-agnostic.
- Ecosystem migration responsibility is explicitly assigned to upper-layer packages.
