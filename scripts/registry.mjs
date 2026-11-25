import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs"

const { dependencies } = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"))
const base = ["@base-ui/react", "lucide-react"]
const theme = ["@fontsource-variable/inter", "@fontsource-variable/jetbrains-mono"]
const entries = {
  theme: { title: "Theme and tokens", description: "Indigo and slate colors, typography, density, and light and dark themes.", files: ["tokens.css", "theme.ts"], packages: theme },
  hooks: { title: "Hooks", description: "Controllable state, keyboard shortcuts, media queries, clipboard, debouncing, and disclosure state.", files: ["hooks.ts"], lib: true },
  button: { title: "Button", description: "Nine variants, four heights, button groups, hold-to-confirm, async and copy buttons, and keyboard hints.", files: ["button.tsx", "cx.ts"], needs: ["theme", "hooks"], packages: base },
  toggle: { title: "Toggle", description: "A pressable button that stays on, and groups of them.", files: ["toggle.tsx", "cx.ts"], needs: ["theme"], packages: base },
  "input-group": { title: "Input Group", description: "Inputs with icons, units, buttons, and shortcut hints, plus search and password inputs.", files: ["input-group.tsx"], needs: ["form", "button"] },
  command: { title: "Command", description: "A searchable command list and a keyboard-driven command palette.", files: ["command.tsx"], needs: ["button"] },
  item: { title: "Item", description: "A list row with media, a title and description, and actions.", files: ["item.tsx", "cx.ts"], needs: ["theme"] },
  "scroll-area": { title: "Scroll Area", description: "A scrolling region with overlay scrollbars and edge fades.", files: ["scroll-area.tsx", "cx.ts"], needs: ["theme"], packages: ["@base-ui/react"] },
  form: { internal: true, title: "Form controls", description: "Fields, text inputs, checkbox, switch, radio group, and segmented controls.", files: ["form.tsx", "cx.ts"], needs: ["theme"], packages: base },
  select: { title: "Select", description: "Base UI select with jns ui field styles.", files: ["select.tsx"], needs: ["form"] },
  combobox: { title: "Combobox", description: "A searchable picker that supports local and remote options.", files: ["combobox.tsx"], needs: ["select"] },
  display: { internal: true, title: "Display and feedback", description: "Badges, tabs, tables, callouts, toasts, and empty states.", files: ["display.tsx"], needs: ["button", "avatar"] },
  overlay: { internal: true, title: "Overlays", description: "Dialog with alert and sheet variants, dropdown and context menus, popover and hover card, and tooltip.", files: ["overlay.tsx"], needs: ["button", "select"] },
  layout: { internal: true, title: "Page layout", description: "Headers, breadcrumbs, panels, record bodies, settings rows, and save bars.", files: ["layout.tsx", "cx.ts"], needs: ["theme"], packages: ["lucide-react"] },
  sidebar: { title: "Sidebar", description: "Grouped navigation, compact desktop rail, and a mobile drawer.", files: ["shell.tsx"], needs: ["button"] },
  accordion: { title: "Accordion", description: "Expandable sections.", files: ["accordion.tsx"], needs: ["theme"], packages: base },
  avatar: { title: "Avatar", description: "Profile image with initials and icon fallback.", files: ["avatar.tsx", "cx.ts"], needs: ["theme"], packages: base },
  card: { title: "Card", description: "Bordered content with a header and footer.", files: ["card.tsx", "cx.ts"], needs: ["theme"] },
  collapsible: { title: "Collapsible", description: "Toggle a single region of additional content.", files: ["collapsible.tsx"], needs: ["theme"], packages: base },
  pagination: { title: "Pagination", description: "Previous and next page controls.", files: ["pagination.tsx"], needs: ["button"] },
  progress: { title: "Progress", description: "Determinate and indeterminate task progress.", files: ["progress.tsx"], needs: ["theme"], packages: ["@base-ui/react"] },
  separator: { title: "Separator", description: "Horizontal and vertical dividers.", files: ["separator.tsx", "cx.ts"], needs: ["theme"], packages: ["@base-ui/react"] },
  slider: { title: "Slider", description: "Keyboard-accessible numeric control.", files: ["slider.tsx"], needs: ["theme"], packages: ["@base-ui/react"] },
  "sidebar-workspace": { title: "Workspace sidebar", description: "A full workspace shell with a workspace switcher, account menu, and grouped navigation.", files: ["sidebar-blocks.tsx"], needs: ["sidebar", "card", "display", "overlay", "layout"], block: true },
  "sidebar-projects": { title: "Project sidebar", description: "A full project desk with a compact rail, project search, and a work queue.", files: ["sidebar-blocks.tsx"], needs: ["sidebar", "card", "display", "overlay", "layout"], block: true },
  "activity-feed": { title: "Activity feed", description: "A timeline of workspace changes with avatars, timestamps, and status badges.", files: ["activity-feed.tsx"], needs: ["card", "display"], block: true },
  "list-page": { title: "List page", description: "Searchable and filterable project table with empty states.", files: ["list-page.tsx", "project.ts"], needs: ["display", "layout", "select"], block: true },
  "record-page": { title: "Record page", description: "Project notes, attribute rail, edit action, and optional delete confirmation.", files: ["record-page.tsx", "project.ts"], needs: ["display", "layout", "overlay"], block: true },
  "form-page": { title: "Form page", description: "Create or edit project details with validation and a sticky save bar.", files: ["form-page.tsx", "project.ts"], needs: ["display", "layout", "select"], block: true },
  "settings-page": { title: "Settings page", description: "Theme and sidebar controls with settings rows.", files: ["settings-page.tsx"], needs: ["layout", "select"], block: true },
  "workspace-page": { title: "Workspace page", description: "Summary metrics and recent project activity.", files: ["workspace-page.tsx", "project.ts"], needs: ["layout", "display"], block: true },
}

// Some existing primitives share one source module. Each gets its own install address.
const groupedComponents = {
  display: { alert: "Alert", badge: "Badge", empty: "Empty", meter: "Meter", skeleton: "Skeleton", spinner: "Spinner", table: "Table", tabs: "Tabs", toast: "Toast" },
  overlay: { dialog: "Dialog", "dropdown-menu": "Menu", popover: "Popover", tooltip: "Tooltip" },
  form: { checkbox: "Checkbox", field: "Field", input: "Input", "radio-group": "Radio Group", segmented: "Segmented", switch: "Switch", textarea: "Textarea" },
  layout: { breadcrumb: "Breadcrumb" },
  button: { kbd: "Kbd", "button-group": "Button Group" },
  toggle: { "toggle-group": "Toggle Group" },
  "input-group": { "number-field": "Number Field", "input-otp": "Input OTP" },
}
for (const [group, components] of Object.entries(groupedComponents)) {
  for (const [name, title] of Object.entries(components)) entries[name] = { title, files: [], needs: [group] }
}

function include(name, files = new Set(), packages = new Set()) {
  const item = entries[name]
  for (const file of item.files) files.add(file)
  for (const pkg of item.packages ?? []) packages.add(pkg)
  for (const dependency of item.needs ?? []) include(dependency, files, packages)
  return { files, packages }
}

const items = Object.entries(entries).filter(([, item]) => !item.internal).map(([name, { title, description, block, lib }]) => {
  const { files, packages } = include(name)
  return {
    name,
    type: block ? "registry:block" : lib ? "registry:lib" : "registry:ui",
    title,
    description,
    // Include relative source dependencies so a direct JSON URL also works without a namespace.
    dependencies: [...packages].map((pkg) => `${pkg}@${dependencies[pkg]}`),
    files: [...files].map((file) => ({
      path: `src/ui/${file}`,
      target: `@ui/${file}`,
      type: file.endsWith(".css") ? "registry:file" : "registry:ui",
    })),
  }
})

// Remove obsolete generated items when a name changes between local builds.
const previousIndex = new URL("../public/r/registry.json", import.meta.url)
if (existsSync(previousIndex)) {
  const previousItems = JSON.parse(readFileSync(previousIndex, "utf8")).items
  const currentNames = new Set(items.map(({ name }) => name))
  for (const { name } of previousItems) {
    if (/^[a-z0-9-]+$/.test(name) && !currentNames.has(name)) {
      rmSync(new URL(`${name}.json`, previousIndex), { force: true })
    }
  }
}

writeFileSync(new URL("../registry.json", import.meta.url), JSON.stringify({
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "jns-ui",
  homepage: process.env.JNS_REGISTRY_HOMEPAGE ?? "http://127.0.0.1:4173/",
  items,
}, null, 2) + "\n")
