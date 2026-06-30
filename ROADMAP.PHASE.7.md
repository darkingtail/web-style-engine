# Phase 7: Advanced Modes

[Back to roadmap](./ROADMAP.md)

## Goal

Improve performance and support advanced tooling.

## Tasks

- [x] Design atomic CSS mode.
- [x] Design static extraction.
- [x] Explore hybrid runtime/static mode.
- [x] Add className source inspection.
- [x] Add serializable rule snapshots.
- [x] Add low-code/editor-oriented metadata APIs.
- [x] Validate Edge runtime compatibility.

## Progress

- Added explicit `mode: 'block' | 'atomic'`.
- Kept block mode as the default runtime behavior.
- Added `extractionMode: 'runtime' | 'static' | 'hybrid'` metadata.
- Added `inspectClassName`, `snapshotRules`, and `getRule`.
- Added serializable rule snapshots for editor and low-code tooling.
- Added Edge-like runtime test with `process` unavailable.
- Added tests for atomic mode fallback and default runtime stability.

## Acceptance

- Advanced modes are behind explicit options.
- Existing runtime mode remains stable.
