# Phase 4: Framework Adapters

[Back to roadmap](./ROADMAP.md)

## Goal

Make framework adapters useful in real apps while keeping core framework-free.

## Tasks

- [x] Vue adapter:
  - [x] provider
  - [x] composable
  - [x] reactive theme support
  - [x] SSR usage example
- [x] React adapter:
  - [x] context provider
  - [x] hook
  - [x] responsive bridge with `useSyncExternalStore`
  - [x] SSR usage example
- [x] Solid adapter:
  - [x] provider
  - [x] signal-friendly theme support
  - [x] SSR usage example
- [x] Keep minimal adapter API available for non-framework runtime usage.

## Progress

- Added provider-style adapter scopes with cleanup.
- Added `createUseStyles`, `useResponsive`, function-backed theme sources, and theme subscriptions.
- Added a React-compatible responsive external store bridge for `useSyncExternalStore`.
- Kept Vue, React, and Solid runtime packages outside `src`.
- Updated Vue and React docs examples to use hook/composable-style APIs.
- Added SSR usage documentation for request-scoped engines and adapters.

## Acceptance

- Vue and React examples use real provider/hook patterns.
- Core package does not import Vue, React, or Solid runtimes.
