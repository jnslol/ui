"use client"

import { useId, useState, type ReactNode } from "react"
import { Building2, Check, ChevronsUpDown, Folder, FolderKanban, LayoutGrid, ListChecks, Search, Settings, Users } from "lucide-react"
import { Avatar } from "./avatar"
import { Button, buttonClass } from "./button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card"
import { Badge, EmptyState, Table, Td, Th, Tr } from "./display"
import { AffixInput, Switch } from "./form"
import { Page, PageHeader, Panel, SettingsRow, SettingsSection, StatGrid } from "./layout"
import { Menu } from "./overlay"
import { AppShell, type SidebarGroup } from "./shell"

const workspaces = {
  "North operations": [
    { name: "Campus rollout", owner: "Maya Chen", status: "Active" },
    { name: "Warehouse coverage", owner: "Jordan Ellis", status: "Planning" },
    { name: "Branch refresh", owner: "Sofia Rivera", status: "Active" },
  ],
  "Field services": [
    { name: "Crew onboarding", owner: "Sofia Rivera", status: "Active" },
    { name: "Vehicle inventory", owner: "Maya Chen", status: "Planning" },
  ],
}
type Workspace = keyof typeof workspaces
const workspaceNames = Object.keys(workspaces) as Workspace[]
const navigation = {
  overview: { label: "Overview", icon: LayoutGrid },
  projects: { label: "Projects", icon: Folder },
  queue: { label: "Work queue", icon: ListChecks },
  members: { label: "Members", icon: Users },
  settings: { label: "Settings", icon: Settings },
}
type Section = keyof typeof navigation
type BlockProps = { actions?: ReactNode }

export function WorkspaceSidebar(props: BlockProps) {
  return <SidebarBlock {...props} variant="workspace" />
}

export function ProjectSidebar(props: BlockProps) {
  return <SidebarBlock {...props} variant="projects" />
}

function SidebarBlock({ variant, actions }: BlockProps & { variant: "workspace" | "projects" }) {
  const workspaceVariant = variant === "workspace"
  const [workspace, setWorkspace] = useState<Workspace>("North operations")
  const [section, setSection] = useState<Section>(workspaceVariant ? "overview" : "projects")
  const [compact, setCompact] = useState(!workspaceVariant)
  const [search, setSearch] = useState("")
  const [notifications, setNotifications] = useState(true)
  const notificationsId = useId()

  function group(label: string, sections: Section[]): SidebarGroup {
    return { label, links: sections.map((id) => {
      const { label, icon: Icon } = navigation[id]
      return {
        label, icon: <Icon aria-hidden />, href: `#${id}`, active: id === section,
        onClick: (event) => { event.preventDefault(); setSection(id) },
      }
    }) }
  }

  const groups = workspaceVariant
    ? [group("Workspace", ["overview", "projects"]), group("Administration", ["members", "settings"])]
    : [group("Delivery", ["projects", "queue"]), group("Preferences", ["settings"])]
  const items = workspaces[workspace]
  const rows = items.filter((item) => item.name.toLowerCase().includes(search.trim().toLowerCase()))
  const heading = navigation[section].label

  return (
    <AppShell
      context={heading} actions={actions} groups={groups} compact={compact} onCompactChange={setCompact} pageKey={section}
      brand={(collapsed) => collapsed ? <FolderKanban aria-hidden className="size-4" /> : workspaceVariant ? (
        <Menu align="start" trigger={
          <Button variant="ghost" className="w-full justify-start">
            <Building2 aria-hidden /><span className="min-w-0 flex-1 truncate text-left">{workspace}</span><ChevronsUpDown aria-hidden />
          </Button>
        } items={workspaceNames.map((name) => ({
          label: name, icon: name === workspace ? <Check aria-hidden /> : <Building2 aria-hidden />, onSelect: () => setWorkspace(name),
        }))} />
      ) : <><FolderKanban aria-hidden className="size-4" /> Project desk</>}
      footer={
        <Menu align="start" trigger={
          <button type="button" className="flex w-full items-center gap-2 rounded-control p-1 text-left hover:bg-hover">
            <Avatar name="Maya Chen" size="md" />
            <span className="min-w-0 flex-1"><span className="block truncate font-medium">Maya Chen</span><span className="block text-label text-muted">Operations lead</span></span>
            <ChevronsUpDown aria-hidden className="size-3.5 text-muted" />
          </button>
        } items={[{ label: "Workspace preferences", icon: <Settings aria-hidden />, onSelect: () => setSection("settings") }]} />
      }
    >
      <Page id={section}>
        <PageHeader title={heading} description={workspaceVariant ? workspace : "Project desk"} />
        {section === "overview" && (
          <>
            <StatGrid items={[{ label: "Projects", value: items.length }, { label: "Active", value: items.filter(({ status }) => status === "Active").length }, { label: "Team members", value: items.length }]} />
            <Card>
              <CardHeader><CardTitle>Next milestone</CardTitle><CardDescription>{items[0].name}</CardDescription></CardHeader>
              <CardContent>Review the project checklist with the assigned lead.</CardContent>
            </Card>
          </>
        )}
        {section === "projects" && (
          <>
            <AffixInput aria-label="Search projects" placeholder="Search projects…" type="search" value={search} onChange={(event) => setSearch(event.target.value)}
              prefix={<Search aria-hidden />} className="w-56 max-w-full [&_svg]:size-4" />
            <Panel>
              {rows.length ? <div className="overflow-auto"><Table>
                <thead><tr><Th scope="col">Project</Th><Th scope="col">Owner</Th><Th scope="col">Status</Th></tr></thead>
                <tbody>{rows.map((item) => (
                  <Tr key={item.name}><Td>{item.name}</Td><Td>{item.owner}</Td><Td><Badge tone={item.status === "Active" ? "success" : "info"} dot>{item.status}</Badge></Td></Tr>
                ))}</tbody>
              </Table></div> : <EmptyState title="No matching projects" description="Try another project name." />}
            </Panel>
          </>
        )}
        {section === "members" && (
          <Card><CardHeader><CardTitle>Workspace members</CardTitle></CardHeader>
            <CardContent><ul className="flex flex-col gap-3">{items.map(({ owner }) => <li className="flex items-center gap-2" key={owner}><Avatar name={owner} />{owner}</li>)}</ul></CardContent>
          </Card>
        )}
        {section === "queue" && (
          <Card>
            <CardHeader><CardTitle>Ready for review</CardTitle></CardHeader>
            <CardContent><ul className="flex list-disc flex-col gap-2 pl-4"><li>Confirm the campus schedule</li><li>Review the warehouse site plan</li></ul></CardContent>
          </Card>
        )}
        {section === "settings" && (
          <SettingsSection title="Workspace preferences">
            <SettingsRow label="Project updates" description="Receive notifications when a project changes." htmlFor={notificationsId}>
              <Switch id={notificationsId} checked={notifications} onCheckedChange={setNotifications} />
            </SettingsRow>
          </SettingsSection>
        )}
      </Page>
    </AppShell>
  )
}
