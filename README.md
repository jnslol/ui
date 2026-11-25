# jns ui

A source registry and two full-stack starters based on the ISP staff app’s Base UI design system. The registry carries over its slate and indigo tokens, 13 px body text, compact controls, status tones, and light and dark themes. The catalog and both starters use the same component source.

[Documentation, component previews, and template downloads](https://jnslol.github.io/ui/)

## Run the catalog

Requires Node.js 24 or newer and npm.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:4173. Try the grouped sidebar in compact mode and on narrow screens, then open the Workspace, List, Record, Form, and Settings examples. The catalog’s project examples use in-memory data. The starters persist project changes in a database.

## Install components

Use a shadcn-initialized React 19 project with Tailwind CSS v4 and CSS variables. Install via a registry item URL from the catalog:

```sh
npx shadcn@latest add https://jnslol.github.io/ui/r/jns-shell.json
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
npx shadcn@latest add @jns/jns-button @jns/jns-list-page
```

Items install transitive source files under the configured `aliases.ui` directory. Import `staff-tokens.css` once in your global CSS, directly after Tailwind. Adjust this path to match the location of that stylesheet and your UI directory.

```css
@import "tailwindcss";
@import "./components/ui/staff-tokens.css";
```

The tokens set global typography, focus styles, the Tailwind spacing unit, and shared color names. Review these global styles when adding jns ui to an existing themed app. Dark mode uses `<html data-theme="dark">`. The `useStaffTheme` hook handles light, dark, and system preference.

| Installable item | Contents |
| --- | --- |
| `jns-theme` | Tailwind tokens, fonts, and theme hook |
| `jns-button` | Buttons, async and copy actions, keyboard hints |
| `jns-form`, `jns-select`, `jns-combobox` | Inputs, fields, switches, checkboxes, radio groups, and pickers |
| `jns-display` | Tables, badges, callouts, tabs, toasts, and empty states |
| `jns-overlay` | Dialogs, menus, tooltips, and popovers |
| `jns-layout` | Page headers, panels, breadcrumbs, settings rows, and save bars |
| `jns-shell` | Grouped sidebar, header, compact desktop mode, and mobile drawer |
| `jns-*-page` | Workspace, list, record, form, and settings blocks, ready to wire to your router and data |

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
