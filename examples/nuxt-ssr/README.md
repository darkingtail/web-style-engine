# web-style-engine Nuxt SSR example

This example shows a project-level Nuxt integration for Vue SSR.

- `plugins/style-engine.ts` creates one `web-style-engine` runtime for the current SSR render or browser session.
- Nuxt `useHead()` receives the collected CSS after the app render finishes.
- The browser renderer hydrates existing `style[data-nuxt-ssr]` tags before client-side updates.
- `app.vue` is a normal interactive Vue business component using the Vue-facing facade.

Run it from the repository root:

```sh
pnpm --dir examples/nuxt-ssr dev
pnpm --dir examples/nuxt-ssr build
```
