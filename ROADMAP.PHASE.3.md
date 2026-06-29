# Phase 3: Theme and Token System

[Back to roadmap](./ROADMAP.md)

## Goal

Support real design-system integration without binding to any specific design system.

## Tasks

- [x] Add theme runtime protocol.
- [x] Add scoped theme support.
- [x] Implement CSS vars fallback behavior.
- [x] Add token alias resolution.
- [x] Add derivative token support.
- [x] Add token diff helpers.
- [x] Add dark/light theme example.
- [x] Add multiple themes on one page example.

## Progress

- Added framework-free `createThemeRuntime`.
- Added scoped theme registration with default `[data-theme="name"]` selectors and custom scopes.
- Added CSS variable maps with optional fallback values.
- Added token alias resolution, derivative token composition, and flattened token diff helpers.
- Added tests for scoped theme SSR extraction.
- Added docs and examples for dark/light and multiple themes on one page.

## Acceptance

- Theme values can be scoped and SSR-extracted.
- CSS vars can expose fallback values.
- Token helpers remain design-system agnostic.
