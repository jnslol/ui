# jns ui

A source registry and two full-stack starters based on the ISP staff app’s Base UI design system. The registry carries over its slate and indigo tokens, 13 px body text, compact controls, status tones, and light and dark themes. The catalog and both starters use the same component source.

[Documentation, component previews, and template downloads](https://jnslol.github.io/ui/)

## Run the catalog

Requires Node.js 24 or newer and npm.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:4173. Browse the **Components** section for a preview and installation command for each component. Open **Pages and blocks** to try two responsive sidebars, an activity feed, and five page layouts. The catalog’s project examples use in-memory data. The starters persist project changes in a database.

## Install components

Use a shadcn-initialized React 19 project with Tailwind CSS v4 and CSS variables. Install via a registry item URL from the catalog:

```sh
npx shadcn@latest add https://jnslol.github.io/ui/r/sidebar-workspace.json
```

For shorter commands, add this to the existing `registries` in your `components.json`:

```json
{
  "registries": {
    "@jns": "https://jnslol.github.io/ui/r/{name}.json"
  }
}
```

```sh
npx shadcn@latest add @jns/avatar @jns/button
```

Items install transitive source files under the configured `aliases.ui` directory. Import `staff-tokens.css` once in your global CSS, directly after Tailwind. Adjust this path to match the location of that stylesheet and your UI directory.

```css
@import "tailwindcss";
@import "./components/ui/staff-tokens.css";
```

The tokens set global typography, focus styles, the Tailwind spacing unit, and shared color names. Review these global styles when adding jns ui to an existing themed app. Dark mode uses `<html data-theme="dark">`. The `useStaffTheme` hook handles light, dark, and system preference.

Use the `@jns` namespace or a full item URL to select this registry. For example, `@jns/avatar` installs the jns ui avatar, while `@jns/sidebar-workspace` installs a working workspace shell. The generated `r/registry.json` lists all components and blocks.

To build for another host, set `JNS_REGISTRY_HOMEPAGE` to the catalog URL, run `npm run build`, and serve `dist/`. The registry catalog is at `r/registry.json` and the items are at `r/<item>.json`. Point `components.json` at that deployment. The [shadcn registry documentation](https://ui.shadcn.com/docs/registry/getting-started) covers hosting and discovery.

## Full-stack templates

Both GitHub template repositories include Vite, React, TanStack Router and Query, Hono RPC, Zod, Drizzle migrations, and a project CRUD example. Each has its own copy of the UI source and setup instructions.

- [PGlite template](https://github.com/jnslol/ui-template-pglite) runs PostgreSQL in the API process and stores data locally.
- [PostgreSQL template](https://github.com/jnslol/ui-template-postgres) connects to a dedicated database and includes an optional Docker Compose service.

## Maintain the library

- Edit `src/ui/` to change the source distributed by the registry and demonstrated in the catalog.
- Edit `scripts/registry.mjs` to change the registry entries and their dependencies. `npm run registry:build` generates the shadcn manifest and installable JSON.
- Run `npm run check`, `npm run build`, and `npm test`. Install Chromium with `npx playwright install chromium` before your first test run.
- Run the `Deploy documentation` workflow manually when a site release is approved.
