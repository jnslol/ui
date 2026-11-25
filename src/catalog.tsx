import { useState, type ReactNode } from "react"
import { Bell, FolderOpen, Info, Plus, Trash2 } from "lucide-react"
import { Accordion } from "./ui/staff-accordion"
import { Avatar } from "./ui/staff-avatar"
import { Badge, Callout, EmptyState, Meter, Skeleton, Spinner, Table, TabPanel, Tabs, Td, Th, toast, ToastProvider, Tr, type Tone } from "./ui/staff-display"
import { Button, Kbd, type ButtonVariant } from "./ui/staff-button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/staff-card"
import { Collapsible } from "./ui/staff-collapsible"
import { Combobox, type ComboItem } from "./ui/staff-combobox"
import { CheckboxField, Field, Input, RadioGroup, Segmented, Switch, Textarea } from "./ui/staff-form"
import { Breadcrumbs, Page, PageHeader, Panel, Section } from "./ui/staff-layout"
import { ConfirmDialog, Dialog, DialogClose, Menu, Popover, Tooltip } from "./ui/staff-overlay"
import { Pagination } from "./ui/staff-pagination"
import { Progress } from "./ui/staff-progress"
import { Select } from "./ui/staff-select"
import { Separator } from "./ui/staff-separator"
import { Slider } from "./ui/staff-slider"

const variants: ButtonVariant[] = ["primary", "secondary", "ghost", "danger", "danger-soft", "link"]
const tones: Tone[] = ["neutral", "accent", "info", "success", "warning", "danger"]
const team = [{ value: "maya", label: "Maya Chen" }, { value: "sofia", label: "Sofia Rivera" }]

export function InstallCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 rounded-control border border-divider bg-subtle px-3 py-1.5">
      <code className="min-w-0 break-all text-label">{command}</code>
      <Button size="xs" onClick={async () => {
        try {
          await navigator.clipboard.writeText(command)
          setCopied(true)
        } catch {
          setCopied(false)
        }
      }} aria-live="polite">{copied ? "Copied" : "Copy"}</Button>
    </div>
  )
}

export function registryUrl(id: string) {
  return new URL(`r/${id}.json`, document.baseURI).href
}

export function installCommand(id: string) {
  return `npx shadcn@latest add "${registryUrl(id)}"`
}

const demos: Record<string, { title: string; description: string; preview: () => ReactNode }> = {
  accordion: {
    title: "Accordion", description: "Show one or more sections of related information.",
    preview: () => <Accordion defaultValue={["scope"]} items={[
      { value: "scope", title: "What is in scope?", content: "Phase one covers the main building." },
      { value: "owner", title: "Who owns the rollout?", content: "The field operations team." },
    ]} />,
  },
  alert: {
    title: "Alert", description: "Surface notices and warnings inline using semantic tones.",
    preview: () => <Callout tone="warning" icon={<Info aria-hidden />} title="Review required">Assign an owner before starting the project.</Callout>,
  },
  "alert-dialog": {
    title: "Alert Dialog", description: "Ask for confirmation before a sensitive or irreversible action.",
    preview: () => <ConfirmDialog trigger={<Button variant="danger-soft"><Trash2 aria-hidden /> Remove project</Button>} title="Remove project?"
      cancelLabel="Cancel" confirmLabel="Remove" onConfirm={() => {}} />,
  },
  avatar: {
    title: "Avatar", description: "Display a profile image with initials as a fallback. Pass src for an image and decorative={false} when the avatar identifies someone on its own.",
    preview: () => <div className="flex items-center gap-3">
      <Avatar name="Maya Chen" decorative={false} />
      <Avatar name="Sofia Rivera" size="md" decorative={false} />
      <Avatar name="Jordan Ellis" size="lg" decorative={false} />
    </div>,
  },
  badge: {
    title: "Badge", description: "Label a status using text and an optional colored dot.",
    preview: () => <div className="flex flex-wrap gap-2">{tones.map((tone) => <Badge key={tone} tone={tone} dot>{tone}</Badge>)}</div>,
  },
  breadcrumb: {
    title: "Breadcrumb", description: "Show where the current page sits in the navigation hierarchy.",
    preview: () => <Breadcrumbs items={[{ label: "Workspace", render: <a href="#/workspace" /> }, { label: "Projects", render: <a href="#/projects" /> }, { label: "Campus rollout" }]} />,
  },
  button: {
    title: "Button", description: "Trigger actions with three control sizes and six variants.",
    preview: () => <div className="flex flex-col gap-3">
      {(["md", "sm", "xs"] as const).map((size) => (
        <div className="flex flex-wrap items-center gap-2" key={size}>
          <span className="w-8 text-label text-muted">{size}</span>
          {variants.map((variant) => <Button key={variant} variant={variant} size={size}>{variant}</Button>)}
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-2"><Button variant="primary" loading>Saving</Button><Button disabled>Disabled</Button><Button><Plus aria-hidden /> New project</Button></div>
    </div>,
  },
  card: {
    title: "Card", description: "Group related information and its actions on a bordered surface.",
    preview: () => <Card className="max-w-sm">
      <CardHeader><CardTitle>Campus rollout</CardTitle><CardDescription>Field operations</CardDescription></CardHeader>
      <CardContent><Badge tone="success" dot>Active</Badge></CardContent>
      <CardFooter><a className="font-medium text-accent-fg hover:underline" href="#/projects">View projects</a></CardFooter>
    </Card>,
  },
  checkbox: {
    title: "Checkbox", description: "Let users select more than one option or opt into a setting.",
    preview: () => <CheckboxField label="Include archived projects" defaultChecked />,
  },
  collapsible: {
    title: "Collapsible", description: "Reveal optional details on demand.",
    preview: () => <Collapsible label="Show project details">Phase one covers the main building and reception area.</Collapsible>,
  },
  combobox: { title: "Combobox", description: "Search and select from a list of options.", preview: ComboboxPreview },
  dialog: {
    title: "Dialog", description: "Present focused information or a short task in a modal.",
    preview: () => <Dialog trigger={<Button>View project summary</Button>} title="Project summary" description="North Campus rollout"
      footer={<DialogClose render={<Button variant="primary" />}>Done</DialogClose>}><p>The field operations team is preparing the site survey.</p></Dialog>,
  },
  "dropdown-menu": { title: "Dropdown Menu", description: "Group actions behind a compact trigger.", preview: MenuPreview },
  empty: {
    title: "Empty", description: "Explain why a view has no records and how to continue.",
    preview: () => <EmptyState icon={<FolderOpen aria-hidden />} title="No projects found" description="Try searching for another project." />,
  },
  field: {
    title: "Field", description: "Associate an input with its label, hint, and validation message.",
    preview: () => <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Project name" hint="Use a name the team will recognize."><Input placeholder="North Campus" /></Field>
      <Field label="Owner email" error="Enter a valid email address."><Input defaultValue="maya@" /></Field>
    </div>,
  },
  input: {
    title: "Input", description: "Collect short text, email addresses, and search queries.",
    preview: () => <Field label="Project name" className="max-w-xs"><Input placeholder="North Campus" /></Field>,
  },
  kbd: {
    title: "Kbd", description: "Render a keyboard shortcut with consistent sizing and typography.",
    preview: () => <div className="flex items-center gap-2">Search projects <Kbd>Ctrl</Kbd><Kbd>K</Kbd></div>,
  },
  meter: {
    title: "Meter", description: "Show a measurement against warning and critical thresholds.",
    preview: () => <Meter value={76} min={0} max={100} warn={60} critical={30} label="Service health" valueText="76 / 100" />,
  },
  pagination: { title: "Pagination", description: "Navigate sequential pages with explicit previous and next controls.", preview: PaginationPreview },
  popover: {
    title: "Popover", description: "Show short details beside their trigger.",
    preview: () => <Popover trigger={<Button>Project details</Button>}><p className="p-3">Last updated by Maya Chen.</p></Popover>,
  },
  progress: {
    title: "Progress", description: "Show task completion or an indeterminate state while a task is running.",
    preview: () => <div className="flex max-w-sm flex-col gap-4"><Progress value={68} label="Importing projects" /><Progress value={null} label="Preparing report" /></div>,
  },
  "radio-group": { title: "Radio Group", description: "Choose exactly one option from a short list.", preview: RadioPreview },
  segmented: { title: "Segmented", description: "Switch between a short set of related views.", preview: SegmentedPreview },
  select: { title: "Select", description: "Choose an option from a compact menu.", preview: SelectPreview },
  separator: {
    title: "Separator", description: "Separate related content horizontally or vertically.",
    preview: () => <div className="flex flex-col gap-3"><span>Workspace preferences</span><Separator /><div className="flex gap-3"><span>Members</span><Separator orientation="vertical" /><span>Permissions</span></div></div>,
  },
  sidebar: {
    title: "Sidebar", description: "A responsive sidebar with grouped navigation, a compact rail, and a mobile drawer.",
    preview: () => <div className="flex flex-wrap gap-3">
      <a href="#/preview/sidebar-workspace" className="font-medium text-accent-fg hover:underline">Preview workspace sidebar</a>
      <a href="#/preview/sidebar-projects" className="font-medium text-accent-fg hover:underline">Preview project sidebar</a>
    </div>,
  },
  skeleton: {
    title: "Skeleton", description: "Reserve space while content loads.",
    preview: () => <div className="flex items-center gap-3"><Skeleton className="size-8 rounded-full" /><div className="flex flex-col gap-2"><Skeleton className="h-3 w-32" /><Skeleton className="h-3 w-20" /></div></div>,
  },
  slider: {
    title: "Slider", description: "Adjust a numeric value with pointer or keyboard controls.",
    preview: () => <div className="max-w-sm"><Slider label="Alert threshold" defaultValue={65} min={0} max={100} step={5} /></div>,
  },
  spinner: {
    title: "Spinner", description: "Indicate that an action is running.",
    preview: () => <div className="flex items-center gap-2"><Spinner /><span role="status">Loading projects…</span></div>,
  },
  switch: {
    title: "Switch", description: "Turn a setting on or off.",
    preview: () => <label className="flex w-fit items-center gap-2"><Switch defaultChecked /> Project notifications</label>,
  },
  table: {
    title: "Table", description: "Present records in dense rows with column headers.",
    preview: () => <Panel className="overflow-auto"><Table>
      <thead><tr><Th scope="col">Project</Th><Th scope="col">Status</Th></tr></thead>
      <tbody><Tr><Td>Campus rollout</Td><Td><Badge tone="success" dot>Active</Badge></Td></Tr></tbody>
    </Table></Panel>,
  },
  tabs: { title: "Tabs", description: "Switch between related panels with keyboard support.", preview: TabsPreview },
  textarea: {
    title: "Textarea", description: "Collect notes or other multiline text.",
    preview: () => <Field label="Project notes" className="max-w-sm"><Textarea placeholder="Add notes for the team" /></Field>,
  },
  theme: {
    title: "Theme", description: "Semantic color, type, spacing, and surface tokens for light and dark mode.",
    preview: () => <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {[["Page", "bg-bg"], ["Surface", "bg-surface"], ["Subtle", "bg-subtle"], ["Accent", "bg-accent"]].map(([name, color]) => (
        <div className="flex flex-col gap-1 text-label font-medium" key={name}><span className={`h-10 rounded-control border ${color}`} />{name}</div>
      ))}
    </div>,
  },
  toast: {
    title: "Toast", description: "Show a short status message without interrupting the current task.",
    preview: () => <ToastProvider><Button onClick={() => toast("Changes saved", { description: "The project is up to date.", tone: "success" })}><Bell aria-hidden /> Show toast</Button></ToastProvider>,
  },
  tooltip: {
    title: "Tooltip", description: "Add a short explanation to a control on hover or keyboard focus.",
    preview: () => <Tooltip content="Add a project to this workspace"><Button>Add project</Button></Tooltip>,
  },
}

export const componentLinks = Object.entries(demos).map(([id, { title }]) => ({ id, title }))

export function Components({ id }: { id?: string }) {
  const entry = id && Object.hasOwn(demos, id) ? demos[id] : undefined
  if (!entry || !id) {
    return (
      <Page width="narrow">
        <PageHeader title="Components" description="Browse and install individually styled Base UI components." />
        <div className="grid gap-2 sm:grid-cols-2">
          {componentLinks.map(({ id, title }) => (
            <a key={id} href={`#/components/${id}`} className="rounded-card border bg-surface px-3 py-2 font-medium hover:bg-hover">{title}</a>
          ))}
        </div>
      </Page>
    )
  }

  const Preview = entry.preview
  return (
    <Page width="narrow">
      <Breadcrumbs items={[{ label: "Components", render: <a href="#/components" /> }, { label: entry.title }]} />
      <PageHeader title={entry.title} description={entry.description}
        actions={<a className="text-label text-accent-fg hover:underline" href={registryUrl(id)}>Registry JSON</a>} />
      <Section title="Preview"><Panel className="p-4"><Preview /></Panel></Section>
      <Section title="Installation"><InstallCommand command={installCommand(id)} /></Section>
    </Page>
  )
}

function ComboboxPreview() {
  const [person, setPerson] = useState<ComboItem | null>(null)
  return <Combobox className="w-48" aria-label="Project owner" items={team} value={person} onValueChange={setPerson} placeholder="Find an owner…" emptyText="No matching owners." filter />
}

function MenuPreview() {
  const [status, setStatus] = useState("")
  return (
    <div className="flex items-center gap-3">
      <Menu align="start" trigger={<Button>Project actions</Button>} items={[{ label: "Mark reviewed", onSelect: () => setStatus("Marked as reviewed.") }]} />
      <span role="status" className="text-muted">{status}</span>
    </div>
  )
}

function PaginationPreview() {
  const [page, setPage] = useState(1)
  return <Pagination page={page} totalPages={5} onPageChange={setPage} />
}

function RadioPreview() {
  const [value, setValue] = useState<"standard" | "expedited">("standard")
  return <RadioGroup options={[{ value: "standard", label: "Standard" }, { value: "expedited", label: "Expedited" }]} value={value} onValueChange={setValue} />
}

function SegmentedPreview() {
  const [value, setValue] = useState<"list" | "grid">("list")
  return <Segmented aria-label="Project view" options={[{ value: "list", label: "List" }, { value: "grid", label: "Grid" }]} value={value} onValueChange={setValue} />
}

function SelectPreview() {
  const [plan, setPlan] = useState("standard")
  return <Select className="w-48" aria-label="Plan" value={plan} onValueChange={setPlan} options={[{ value: "standard", label: "Standard" }, { value: "team", label: "Team" }]} />
}

function TabsPreview() {
  const [value, setValue] = useState<"details" | "activity">("details")
  return <Tabs items={[{ value: "details", label: "Details" }, { value: "activity", label: "Activity" }]} value={value} onValueChange={setValue}>
    <TabPanel value="details" className="pt-3">Maya Chen owns this project.</TabPanel>
    <TabPanel value="activity" className="pt-3">Status changed to Active.</TabPanel>
  </Tabs>
}
