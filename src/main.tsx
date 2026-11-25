import { useState, useSyncExternalStore } from "react"
import { createRoot } from "react-dom/client"
import { BookOpen, Box, Download, FileText, Folder, House, LayoutGrid, PanelsTopLeft, Settings } from "lucide-react"
import { Components, InstallCommand } from "./catalog"
import { Blocks, Overview, Setup, Templates, repository } from "./guide"
import { buttonClass } from "./ui/staff-button"
import { sampleProjects } from "./demo-data"
import { TooltipProvider } from "./ui/staff-overlay"
import { ProjectList } from "./ui/staff-list-page"
import { ProjectRecord } from "./ui/staff-record-page"
import { ProjectForm } from "./ui/staff-form-page"
import { WorkspaceSettings } from "./ui/staff-settings-page"
import { WorkspacePage } from "./ui/staff-workspace-page"
import { StaffShell } from "./ui/staff-shell"
import { useStaffTheme } from "./ui/staff-theme"
import "./index.css"

const links = [
  { label: "Library", items: [["Overview", "/", House], ["Installation", "/setup", BookOpen], ["Components", "/components", Box], ["Pages and blocks", "/blocks", PanelsTopLeft], ["Templates", "/templates", Download]] },
  { label: "Examples", items: [
    ["Workspace", "/workspace", LayoutGrid], ["List", "/projects", Folder],
    ["Record", `/projects/${sampleProjects[0].id}`, FileText], ["Form", "/new", PanelsTopLeft], ["Settings", "/settings", Settings],
  ] },
] as const

const subscribe = (callback: () => void) => {
  window.addEventListener("hashchange", callback)
  return () => window.removeEventListener("hashchange", callback)
}
const path = () => window.location.hash.slice(1) || "/"
const recordHref = (id: string) => `#/projects/${id}`

function Catalog() {
  const page = useSyncExternalStore(subscribe, path)
  const [projects, setProjects] = useState(sampleProjects)
  const [compact, setCompact] = useState(false)
  const [theme, setTheme] = useStaffTheme()
  const project = projects.find((project) => page === `/projects/${project.id}` || page === `/edit/${project.id}`)
  const form = page === "/new" || page.startsWith("/edit/")
  const record = !form && Boolean(project)
  const activePage = form ? "/new" : record ? links[1].items[2][1] : page
  const groups = links.map(({ label, items }) => ({
    label,
    links: items.map(([name, to, Icon]) => ({ label: name, href: `#${to}`, icon: <Icon aria-hidden />, active: activePage === to })),
  }))
  const title = groups.flatMap((group) => group.links).find((item) => item.active)?.label ?? "Examples"
  const block = form ? "form" : record ? "record" : ({ "/projects": "list", "/workspace": "workspace", "/settings": "settings" } as Record<string, string>)[page]

  let content
  if (page === "/workspace") content = <WorkspacePage projects={projects} listHref="#/projects" recordHref={recordHref} />
  else if (page === "/projects") content = <ProjectList projects={projects} createHref="#/new" recordHref={recordHref} />
  else if (form) content = (
    <ProjectForm key={page} initial={project} listHref="#/projects" cancelHref={project ? recordHref(project.id) : undefined}
      onSave={async (draft) => {
        const saved = { ...draft, id: project?.id ?? crypto.randomUUID() }
        setProjects((previous) => project ? previous.map((item) => item.id === project.id ? saved : item) : [saved, ...previous])
        window.location.hash = recordHref(saved.id)
      }} />
  )
  else if (project) content = <ProjectRecord key={project.id} project={project} listHref="#/projects" editHref={`#/edit/${project.id}`} />
  else if (page === "/settings") content = <WorkspaceSettings theme={theme} onThemeChange={setTheme} compact={compact} onCompactChange={setCompact} />
  else if (page === "/setup") content = <Setup />
  else if (page === "/components") content = <Components />
  else if (page === "/blocks") content = <Blocks />
  else if (page === "/templates") content = <Templates />
  else content = <Overview />

  return (
    <TooltipProvider>
      <StaffShell pageKey={page} context={title} groups={groups} compact={compact} onCompactChange={setCompact}
        brand={(collapsed) => <><span className="grid size-6 shrink-0 place-items-center rounded-control bg-accent text-accent-on"><Box className="size-4" aria-hidden /></span>{!collapsed && "jns ui"}</>}
        footer={<a href={new URL("r/registry.json", document.baseURI).href} className="text-label text-muted hover:text-fg">Registry index ↗</a>}>
        {content}
        {block && <div className="mx-auto max-w-[1400px] px-4 pb-6 md:px-6"><InstallCommand key={block}
          command={`npx shadcn@latest add "${new URL(`r/jns-${block}-page.json`, document.baseURI).href}"`} /></div>}
      </StaffShell>
    </TooltipProvider>
  )
}

createRoot(document.getElementById("root")!).render(<Catalog />)
