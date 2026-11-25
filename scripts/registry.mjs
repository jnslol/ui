import { readFileSync, writeFileSync } from "node:fs"

const { dependencies } = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"))
const base = ["@base-ui/react", "lucide-react"]
const theme = ["@fontsource-variable/inter", "@fontsource-variable/jetbrains-mono"]
const entries = {
  theme: { title: "Theme and tokens", description: "Indigo and slate colors, typography, density, and light and dark themes.", files: ["tokens.css", "theme.ts"], packages: theme },
  button: { title: "Buttons", description: "Six action variants, three control heights, async buttons, and keyboard hints.", files: ["button.tsx", "cx.ts"], needs: ["theme"], packages: base },
  form: { title: "Form controls", description: "Fields, text inputs, checkbox, switch, radio group, and segmented controls.", files: ["form.tsx", "cx.ts"], needs: ["theme"], packages: base },
  select: { title: "Select", description: "Base UI select with staff field styles.", files: ["select.tsx"], needs: ["form"] },
  combobox: { title: "Combobox", description: "A searchable picker that supports local and remote options.", files: ["combobox.tsx"], needs: ["select"] },
  display: { title: "Display and feedback", description: "Badges, tabs, tables, callouts, toasts, and empty states.", files: ["display.tsx"], needs: ["button"] },
  overlay: { title: "Overlays", description: "Dialog, confirmation, menu, popover, and tooltip.", files: ["overlay.tsx"], needs: ["button", "select"] },
  layout: { title: "Page layout", description: "Headers, breadcrumbs, panels, record bodies, settings rows, and save bars.", files: ["layout.tsx", "cx.ts"], needs: ["theme"], packages: ["lucide-react"] },
  shell: { title: "Sidebar and app shell", description: "Grouped navigation with compact desktop mode and a mobile dialog.", files: ["shell.tsx"], needs: ["button"], block: true },
  "list-page": { title: "List page", description: "Searchable and filterable project table with empty states.", files: ["list-page.tsx", "project.ts"], needs: ["display", "layout", "select"], block: true },
  "record-page": { title: "Record page", description: "Project notes, attribute rail, edit action, and optional delete confirmation.", files: ["record-page.tsx", "project.ts"], needs: ["display", "layout", "overlay"], block: true },
  "form-page": { title: "Form page", description: "Create or edit project details with validation and a sticky save bar.", files: ["form-page.tsx", "project.ts"], needs: ["display", "layout", "select"], block: true },
  "settings-page": { title: "Settings page", description: "Theme and sidebar controls with settings rows.", files: ["settings-page.tsx"], needs: ["layout", "select"], block: true },
  "workspace-page": { title: "Workspace page", description: "Summary metrics and recent project activity.", files: ["workspace-page.tsx", "project.ts"], needs: ["layout", "display"], block: true },
}

function include(name, files = new Set(), packages = new Set()) {
  const item = entries[name]
  for (const file of item.files) files.add(file)
  for (const pkg of item.packages ?? []) packages.add(pkg)
  for (const dependency of item.needs ?? []) include(dependency, files, packages)
  return { files, packages }
}

const items = Object.entries(entries).map(([name, { title, description, block }]) => {
  const { files, packages } = include(name)
  return {
    name: `jns-${name}`,
    type: block ? "registry:block" : "registry:ui",
    title,
    description,
    // Include relative source dependencies so a direct JSON URL also works without a namespace.
    dependencies: [...packages].map((pkg) => `${pkg}@${dependencies[pkg]}`),
    files: [...files].map((file) => ({
      path: `src/ui/staff-${file}`,
      target: `@ui/staff-${file}`,
      type: file.endsWith(".css") ? "registry:file" : "registry:ui",
    })),
  }
})

writeFileSync(new URL("../registry.json", import.meta.url), JSON.stringify({
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "jns-ui",
  homepage: process.env.JNS_REGISTRY_HOMEPAGE ?? "http://127.0.0.1:4173/",
  items,
}, null, 2) + "\n")
