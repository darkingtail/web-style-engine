# Implementation status

This file maps the six design documents to the initial code slice.

## Step 1: Style Engine Core

Implemented in `src/core`:

- `StyleEngine` protocol
- `createStyleEngine`
- stable class names
- `css`, `cx`, `keyframes`, `injectGlobal`, `vars`
- registry and dedupe
- transformer hook

## Step 2: Renderer / Runtime

Implemented in `src/renderers`:

- DOM renderer with `container`, `nonce`, and `insertionPoint`
- SSR renderer with extraction and style tag output
- Noop renderer
- Mock renderer

## Step 3: createStylesCore

Implemented in `src/create-styles`:

- framework-independent style factory execution
- theme and props input
- optional responsive context
- label and cache support

## Step 4: Framework adapters

Implemented in `src/adapters`:

- shared adapter runtime
- minimal Vue adapter
- minimal React adapter
- minimal Solid adapter

These are intentionally thin and do not import framework runtimes yet.

## Step 5: Token / CSS Vars / responsive integration

Implemented in `src/tokens` and core `engine.vars`:

- token flattening
- CSS variable name generation
- scoped CSS vars injection
- `px2rem` transformer
- `rtlTransformer`
- responsive slot preserved as optional context

## Step 6: antdv-style migration validation

Implemented in `src/migration`:

- `createStyleEngineFromEmotion` compatibility wrapper scaffold
- `createAntdvStyleMigrationPlan` validation checklist

## Docs site

Astro Starlight scaffold is in `docs-site` with Vue, React, and Solid integrations configured to match the library's framework-agnostic positioning.
