# Phase 2: Responsive Completion

[Back to roadmap](./ROADMAP.md)

## Goal

Make responsive a complete core capability for websites across devices.

## Tasks

- [x] Add media feature helpers:
  - [x] `print`
  - [x] `colorScheme`
  - [x] `reducedMotion`
  - [x] `contrast`
  - [x] `forcedColors`
- [x] Add or reserve container query helpers.
- [x] Add H5 helpers:
  - [x] `px2vw`
  - [x] safe-area helpers
  - [x] viewport unit helpers
- [x] Add iframe and Shadow DOM responsive observer tests.
- [x] Add a full landing page example:
  - [x] mobile
  - [x] tablet
  - [x] desktop
  - [x] wide

## Progress

- Added `responsive.media` helpers for print, color scheme, reduced motion, contrast, and forced colors.
- Added `responsive.container` helpers that reuse breakpoint boundary semantics for container queries.
- Added `responsive.h5` viewport unit and safe-area helpers.
- Added `px2vw` transformer for H5 and WebView output.
- Added observer isolation tests for iframe-like and Shadow DOM host `matchMedia` injection.
- Added a responsive landing page docs example covering mobile, tablet, desktop, and wide breakpoints.

## Acceptance

- Responsive examples demonstrate real website layout changes.
- Media helpers are typed and tested.
- SSR-safe responsive behavior remains stable.
