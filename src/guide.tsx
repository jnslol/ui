import { ArrowUpRight, BookOpen, Box, Download, PanelsTopLeft } from "lucide-react"
import { InstallCommand, installCommand, registryUrl } from "./catalog"
import { sampleProjects } from "./demo-data"
import { ActivityFeed, type ActivityEntry } from "./ui/staff-activity-feed"
import { buttonClass } from "./ui/staff-button"
import { Badge } from "./ui/staff-display"
import { Page, PageHeader, Panel, Section } from "./ui/staff-layout"

export const repository = "https://github.com/jnslol/ui"
const exampleProjectId = sampleProjects[0].id

const blocks = [
  { name: "Workspace sidebar", item: "sidebar-workspace", href: "#/preview/sidebar-workspace", description: "A workspace switcher, grouped navigation, member view, and account menu." },
  { name: "Project sidebar", item: "sidebar-projects", href: "#/preview/sidebar-projects", description: "A compact rail with searchable projects, a work queue, and workspace preferences." },
  { name: "Activity feed", item: "activity-feed", href: "#/activity", description: "Recent changes with actor avatars, timestamps, and status." },
  { name: "Workspace", item: "workspace-page", href: "#/workspace", description: "Key figures and recent activity for an operational home screen." },
  { name: "List", item: "list-page", href: "#/projects", description: "A searchable table with status filters and empty states." },
  { name: "Record", item: "record-page", href: `#/projects/${exampleProjectId}`, description: "An entity header, actions, notes, and a separate attribute rail." },
  { name: "Form", item: "form-page", href: "#/new", description: "Create and edit flows with field validation and a sticky save bar." },
  { name: "Settings", item: "settings-page", href: "#/settings", description: "Grouped settings rows for theme and sidebar preferences." },
]

export function Overview() {
  return (
    <Page width="narrow" className="pt-6">
      <div className="flex flex-col gap-4 border-b border-divider pb-6">
        <div className="grid size-10 place-items-center rounded-card bg-accent text-accent-on"><Box className="size-5" aria-hidden /></div>
        <div className="flex flex-col gap-2">
          <h1 className="text-display font-semibold">jns ui</h1>
          <p className="max-w-xl text-heading text-muted">An opinionated React design system for the software teams use all day. Compact controls, readable records, and consistent page layouts.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href="#/setup" className={buttonClass({ variant: "primary", size: "md" })}><BookOpen aria-hidden /> Installation</a>
          <a href="#/components" className={buttonClass({ size: "md" })}>Browse components</a>
        </div>
      </div>
      <Section title="Start with the layout you need">
        <div className="grid gap-3 sm:grid-cols-2">
          <Panel className="flex flex-col gap-2 p-4">
            <PanelsTopLeft aria-hidden className="size-5 text-accent-fg" />
            <h3 className="text-heading font-semibold"><a href="#/blocks" className="hover:underline">Pages and blocks</a></h3>
            <p className="text-muted">Preview complete sidebars and compose pages from the same components. Install each one with the shadcn CLI.</p>
          </Panel>
          <Panel className="flex flex-col gap-2 p-4">
            <Download aria-hidden className="size-5 text-accent-fg" />
            <h3 className="text-heading font-semibold"><a href="#/templates" className="hover:underline">Full-stack templates</a></h3>
            <p className="text-muted">Run a working project workspace with Vite, Hono, Drizzle, and your choice of PostgreSQL setup.</p>
          </Panel>
        </div>
      </Section>
      <Section title="Design choices">
        <ul className="flex list-disc flex-col gap-1 pl-5 text-muted">
          <li>Use denser controls in tables and toolbars, with more room for form fields.</li>
          <li>Give important records their own pages, with short actions in dialogs.</li>
          <li>Keep status legible by pairing semantic color with a text label.</li>
        </ul>
      </Section>
    </Page>
  )
}

export function Setup() {
  const namespace = JSON.stringify({ registries: { "@jns": registryUrl("{name}").replace("%7Bname%7D", "{name}") } }, null, 2)
  return (
    <Page width="narrow">
      <PageHeader title="Installation" description="Add jns ui components as editable source to a React project." />
      <Section title="Install a block">
        <p>Start with React 19, Tailwind CSS v4, and a shadcn-initialized project. Install any item by its JSON URL.</p>
        <InstallCommand command={installCommand("sidebar-workspace")} />
        <p>The CLI puts the files in the directory configured by <code>aliases.ui</code> and installs their dependencies.</p>
      </Section>
      <Section title="Import the tokens">
        <p>Import <code>staff-tokens.css</code> in your global stylesheet, directly after Tailwind. Adjust the path to your UI directory.</p>
        <pre className="overflow-x-auto rounded-card border border-divider bg-surface p-3 text-label">{'@import "tailwindcss";\n@import "./components/ui/staff-tokens.css";'}</pre>
        <p>Set <code>data-theme</code> on <code>html</code> to <code>light</code> or <code>dark</code>, or use the <code>useStaffTheme</code> hook to follow a saved preference or the system setting.</p>
      </Section>
      <Section title="Use the JNS namespace">
        <p>Merge this configuration into your existing <code>components.json</code> to install items by name.</p>
        <pre className="overflow-x-auto rounded-card border border-divider bg-surface p-3 text-label">{namespace}</pre>
        <InstallCommand command="npx shadcn@latest add @jns/button @jns/list-page" />
      </Section>
    </Page>
  )
}

export function Blocks() {
  return (
    <Page width="narrow">
      <PageHeader title="Pages and blocks" description="Preview complete staff interfaces, then install the pieces you want." />
      {blocks.map(({ name, item, href, description }) => (
        <Section key={item} title={name} description={description}
          actions={<a href={href} className={buttonClass({ size: "xs" })}>Open preview <ArrowUpRight aria-hidden /></a>}>
          <InstallCommand command={installCommand(item)} />
        </Section>
      ))}
    </Page>
  )
}

const recentActivity: ActivityEntry[] = [
  { id: "release", actor: "Maya Chen", action: "completed the campus site survey.", when: "Today at 9:40 AM", status: { label: "Complete", tone: "success" } },
  { id: "coverage", actor: "Jordan Ellis", action: "added the warehouse coverage plan.", when: "Yesterday at 4:15 PM", status: { label: "In review", tone: "info" } },
  { id: "schedule", actor: "Sofia Rivera", action: "updated the branch refresh schedule.", when: "Yesterday at 11:30 AM" },
]

export function ActivityPage() {
  return (
    <Page width="narrow">
      <PageHeader title="Activity feed" description="A record of recent changes in a workspace." />
      <ActivityFeed entries={recentActivity} />
      <InstallCommand command={installCommand("activity-feed")} />
    </Page>
  )
}

const templates = [
  { repo: "ui-template-pglite", name: "Embedded PostgreSQL", technology: "PGlite", description: "The API runs PostgreSQL in process and stores data in a local directory. Use this for a demo or a single-process app." },
  { repo: "ui-template-postgres", name: "PostgreSQL server", technology: "node-postgres", description: "Connect to a dedicated or managed database. Use the optional Docker Compose service for local development." },
]

export function Templates() {
  return (
    <Page width="narrow">
      <PageHeader title="Full-stack templates" description="Vite, React, TanStack Router and Query, Hono RPC, Zod, and Drizzle on Node.js 24+." />
      <Section title="Choose a database">
        {templates.map(({ repo, name, technology, description }) => {
          const url = `https://github.com/jnslol/${repo}`
          return (
            <Panel key={repo} className="flex flex-col gap-3 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-heading font-semibold">{name}</h3><Badge tone="info">{technology}</Badge>
              </div>
              <p className="text-muted">{description}</p>
              <div className="flex flex-wrap gap-2">
                <a className={buttonClass({ variant: "primary" })} href={`${url}/generate`}>Use template</a>
                <a className={buttonClass()} href={url}>View repository</a>
                <a className={buttonClass({ variant: "ghost" })} href={`${url}/archive/refs/heads/main.zip`}><Download aria-hidden /> Download ZIP</a>
              </div>
            </Panel>
          )
        })}
      </Section>
      <Section title="Run a starter">
        <p>Create a GitHub repository from a template and clone it locally, or extract its ZIP. For the PostgreSQL server template, copy <code>.env.example</code> to <code>.env</code> and set <code>DATABASE_URL</code> first.</p>
        <pre className="overflow-x-auto rounded-card border border-divider bg-surface p-3 text-label">{"npm ci\nnpm run db:migrate\nnpm run db:seed\nnpm run dev"}</pre>
        <p>Open <code>http://127.0.0.1:4310</code>. Both templates include a working project list, record, and create/edit flow. Add authentication and roles before exposing the demo API to other users.</p>
      </Section>
    </Page>
  )
}
