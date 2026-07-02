# web-style-engine Next.js SSR example

This example shows a project-level Next.js App Router integration.

- `app/style-registry.tsx` creates one `web-style-engine` runtime per request.
- `useServerInsertedHTML()` inserts the collected CSS into the HTML stream.
- The browser renderer hydrates existing `style[data-next-ssr]` tags before client-side updates.
- `app/business-dashboard.tsx` is a normal interactive business component using the React-facing facade.

Run it from the repository root:

```sh
pnpm --dir examples/next-ssr dev
pnpm --dir examples/next-ssr build
```
