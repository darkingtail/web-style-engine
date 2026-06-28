# Phase 4: Framework Adapters

[Back to roadmap](./ROADMAP.md)

## Goal

Make framework adapters useful in real apps while keeping core framework-free.

## Tasks

- Vue adapter:
  - provider
  - composable
  - reactive theme support
  - SSR usage example
- React adapter:
  - context provider
  - hook
  - responsive bridge with `useSyncExternalStore`
  - SSR usage example
- Solid adapter:
  - provider
  - signal-friendly theme support
  - SSR usage example
- Keep minimal adapter API available for non-framework runtime usage.

## Acceptance

- Vue and React examples use real provider/hook patterns.
- Core package does not import Vue, React, or Solid runtimes.

