import { useState, type ReactNode } from "react"
import {
  AlignCenter, AlignLeft, AlignRight, Archive, Bell, Bold, ChevronDown, ChevronLeft, ChevronRight, Copy, FileText, FolderOpen, Info, Italic,
  Link2, Minus, MoreHorizontal, Pencil, Pin, Plus, Settings, Trash2, Underline, UserPlus, Zap,
} from "lucide-react"
import { Accordion } from "./ui/accordion"
import { Avatar } from "./ui/avatar"
import { Badge, Callout, EmptyState, Meter, Skeleton, Spinner, Table, TabPanel, Tabs, Td, Th, toast, ToastProvider, Tr, type Tone } from "./ui/display"
import { Button, ButtonGroup, CopyButton, HoldButton, Kbd, type ButtonVariant } from "./ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Collapsible } from "./ui/collapsible"
import { Combobox, type ComboItem } from "./ui/combobox"
import { Command, CommandDialog, type CommandItem } from "./ui/command"
import { CheckboxField, Field, Input, RadioGroup, Segmented, Switch, Textarea } from "./ui/form"
import { useCopyToClipboard, useDebouncedValue, useHotkey, useMediaQuery } from "./ui/hooks"
import { InputGroup, NumberInput, OtpInput, PasswordInput, SearchInput } from "./ui/input-group"
import { Item, ItemGroup, ItemIcon } from "./ui/item"
import { Breadcrumbs, Page, PageHeader, Panel, Section } from "./ui/layout"
import { Dialog, DialogClose, Menu, Popover, Tooltip, type DialogVariant, type SheetSide } from "./ui/overlay"
import { Pagination } from "./ui/pagination"
import { Progress } from "./ui/progress"
import { ScrollArea } from "./ui/scroll-area"
import { Select } from "./ui/select"
import { Separator } from "./ui/separator"
import { Slider } from "./ui/slider"
import { Toggle, ToggleGroup } from "./ui/toggle"

const variants: ButtonVariant[] = ["primary", "secondary", "outline", "soft", "ghost", "danger", "danger-soft", "danger-ghost", "link"]
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
    title: "Button", description: "Trigger actions with nine variants and four heights: 24 in tables, 28 in toolbars, 32 in forms, 36 for a page's single call to action. Hold-to-confirm, copy, and async buttons cover common interactions.",
    preview: ButtonPreview,
  },
  "button-group": {
    title: "Button Group", description: "Join related buttons into one control: a split button, a pager, or a set of view actions.",
    preview: () => <div className="flex flex-wrap items-center gap-4">
      <ButtonGroup>
        <Button variant="primary">Save project</Button>
        <Menu trigger={<Button variant="primary" icon aria-label="More save options" className="border-l border-white/20"><ChevronDown aria-hidden /></Button>}
          items={[{ label: "Save as template" }, { label: "Save and close" }]} />
      </ButtonGroup>
      <ButtonGroup aria-label="Page">
        <Button icon aria-label="Previous page"><ChevronLeft aria-hidden /></Button>
        <Button>Page 2 of 8</Button>
        <Button icon aria-label="Next page"><ChevronRight aria-hidden /></Button>
      </ButtonGroup>
      <ButtonGroup orientation="vertical" aria-label="Zoom">
        <Button icon aria-label="Zoom in"><Plus aria-hidden /></Button>
        <Button icon aria-label="Zoom out"><Minus aria-hidden /></Button>
      </ButtonGroup>
    </div>,
  },
  command: { title: "Command", description: "Search and run commands from the keyboard. Press Ctrl K (⌘ K on a Mac) anywhere on this page to open the palette.", preview: CommandPreview },
  hooks: { title: "Hooks", description: "Small utilities the components share: useControllableState, useHotkey, useMediaQuery, useCopyToClipboard, useDebouncedValue, and useDisclosure.", preview: HooksPreview },
  "input-group": { title: "Input Group", description: "Attach icons, units, buttons, and shortcut hints to an input, as one focusable control.", preview: InputGroupPreview },
  "input-otp": { title: "Input OTP", description: "Enter a one-time code, one box per character. Pasting fills every box.", preview: OtpPreview },
  item: {
    title: "Item", description: "A list row with media, a title and description, and actions, for content that isn't a table.",
    preview: () => <ItemGroup className="max-w-lg">
      <Item media={<Avatar name="Maya Chen" />} title="Maya Chen" description="maya@example.com" actions={<Badge tone="accent">Owner</Badge>} />
      <Item media={<Avatar name="Sofia Rivera" />} title="Sofia Rivera" description="sofia@example.com"
        actions={<Menu trigger={<Button variant="ghost" size="xs" icon aria-label="Actions for Sofia Rivera"><MoreHorizontal aria-hidden /></Button>}
          items={[{ label: "Make owner" }, "separator", { label: "Remove", danger: true }]} />} />
      <Item media={<ItemIcon><FileText aria-hidden /></ItemIcon>} title="Site survey.pdf" description="2.4 MB · Updated yesterday" render={<a href="#/components/item" />} />
    </ItemGroup>,
  },
  "number-field": {
    title: "Number Field", description: "Enter a number with steppers. Arrow keys step by one, Shift with arrows by ten, and the format follows the locale.",
    preview: () => <div className="grid max-w-md gap-4 sm:grid-cols-2">
      <Field label="Crew size"><NumberInput defaultValue={4} min={1} max={40} /></Field>
      <Field label="Budget"><NumberInput defaultValue={12500} step={100} largeStep={1000} format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }} /></Field>
    </div>,
  },
  "scroll-area": {
    title: "Scroll Area", description: "Scroll a region with thin overlay scrollbars. With fade, the content dims at any edge with more to scroll.",
    preview: () => <ScrollArea fade aria-label="Project changelog" className="h-48 max-w-sm rounded-card border border-border bg-surface">
      <ul className="flex flex-col divide-y divide-divider">
        {Array.from({ length: 16 }, (_, i) => <li key={i} className="px-3 py-2"><span className="font-medium">v1.{16 - i}.0</span> <span className="text-muted">· Release notes for build {120 - i}</span></li>)}
      </ul>
    </ScrollArea>,
  },
  toggle: {
    title: "Toggle", description: "A two-state button for an option that stays on, such as pinning or text formatting.",
    preview: () => <div className="flex flex-wrap items-center gap-2">
      <Toggle icon aria-label="Bold"><Bold aria-hidden /></Toggle>
      <Toggle icon aria-label="Italic" defaultPressed><Italic aria-hidden /></Toggle>
      <Toggle variant="outline" defaultPressed><Pin aria-hidden /> Pinned</Toggle>
      <Toggle variant="outline" size="xs">Only mine</Toggle>
    </div>,
  },
  "toggle-group": { title: "Toggle Group", description: "A set of toggles. With multiple, several can be on at once. Without it, at most one is on, and pressing it again turns it off.", preview: ToggleGroupPreview },
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
    title: "Dialog", description: "One modal with three variants. Default handles a short task. Alert asks before a consequential action, and only its buttons close it. Sheet slides in from an edge for a longer side task.",
    preview: DialogPreview,
  },
  "dropdown-menu": { title: "Menu", description: "Group actions behind a trigger as a dropdown, or show them on right-click as a context menu. Both variants support checkbox, radio, and nested items.", preview: MenuPreview },
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
    title: "Kbd", description: "Render a keyboard shortcut. The hotkey prop shows the platform's keys: ⌘ on a Mac, Ctrl elsewhere.",
    preview: () => <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">Open the command palette <Kbd hotkey="mod+k" /></div>
      <div className="flex items-center gap-2">New project <Kbd hotkey="mod+shift+n" /></div>
      <div className="flex items-center gap-2">Close <Kbd>Esc</Kbd></div>
    </div>,
  },
  meter: {
    title: "Meter", description: "Show a measurement against warning and critical thresholds.",
    preview: () => <Meter value={76} min={0} max={100} warn={60} critical={30} label="Service health" valueText="76 / 100" />,
  },
  pagination: { title: "Pagination", description: "Navigate sequential pages with explicit previous and next controls.", preview: PaginationPreview },
  popover: { title: "Popover", description: "Show details or a small form beside its trigger. With openOn=\"hover\", it also works as a hover card. Click and Enter still open it.", preview: PopoverPreview },
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
    preview: () => <div className="flex items-center gap-2">
      <Tooltip content="Add a project to this workspace"><Button>Add project</Button></Tooltip>
      <Tooltip content="New project" shortcut={<Kbd hotkey="mod+shift+n" className="[&_kbd]:border-white/20 [&_kbd]:bg-white/10 [&_kbd]:text-white dark:[&_kbd]:border-border dark:[&_kbd]:bg-subtle dark:[&_kbd]:text-muted" />}>
        <Button icon aria-label="New project"><Plus aria-hidden /></Button>
      </Tooltip>
    </div>,
  },
}

export const componentLinks = Object.entries(demos).map(([id, { title }]) => ({ id, title })).sort((a, b) => a.title.localeCompare(b.title))

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

/** A labelled variant switch above a preview, so one page shows every variant of a merged component. */
function VariantBar<V extends string>({ label, options, value, onValueChange, children }: { label: string; options: V[]; value: V; onValueChange: (value: V) => void; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-divider pb-3">
      <span className="text-label text-muted">{label}</span>
      <Segmented aria-label={label} options={options.map((o) => ({ value: o, label: o }))} value={value} onValueChange={onValueChange} />
      {children}
    </div>
  )
}

function ButtonPreview() {
  const [discarded, setDiscarded] = useState(false)
  return (
    <div className="flex flex-col gap-3">
      {(["lg", "md", "sm", "xs"] as const).map((size) => (
        <div className="flex flex-wrap items-center gap-2" key={size}>
          <span className="w-8 text-label text-muted">{size}</span>
          {variants.map((variant) => <Button key={variant} variant={variant} size={size}>{variant}</Button>)}
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-2 border-t border-divider pt-3">
        <Button variant="primary" loading>Saving</Button>
        <Button disabled>Disabled</Button>
        <Button><Plus aria-hidden /> New project</Button>
        <Button icon aria-label="Settings"><Settings aria-hidden /></Button>
        <CopyButton text="PRJ-2041" label="Copy project ID" />
        <HoldButton onConfirm={() => setDiscarded(true)}><Trash2 aria-hidden /> Hold to discard</HoldButton>
        <span role="status" className="text-label text-muted">{discarded ? "Draft discarded." : ""}</span>
      </div>
    </div>
  )
}

function DialogPreview() {
  const [variant, setVariant] = useState<DialogVariant>("default")
  const [side, setSide] = useState<SheetSide>("right")
  const [done, setDone] = useState("")
  const content = {
    default: { label: "View project summary", title: "Project summary", description: "North Campus rollout" },
    alert: { label: "Remove project", title: "Remove project?", description: "North Campus rollout and its 12 tasks will be removed permanently." },
    sheet: { label: "Edit project details", title: "Project details", description: "Changes apply when you save." },
  }[variant]
  return (
    <div className="flex flex-col gap-3">
      <VariantBar label="Variant" options={["default", "alert", "sheet"] as DialogVariant[]} value={variant} onValueChange={setVariant}>
        {variant === "sheet" && <Segmented aria-label="Side" options={(["right", "left", "bottom"] as const).map((o) => ({ value: o, label: o }))} value={side} onValueChange={setSide} />}
      </VariantBar>
      <div className="flex items-center gap-3">
        <Dialog
          key={variant}
          variant={variant}
          side={side}
          trigger={<Button variant={variant === "alert" ? "danger-soft" : "secondary"}>{variant === "alert" && <Trash2 aria-hidden />}{content.label}</Button>}
          title={content.title}
          description={content.description}
          confirmLabel={variant === "alert" ? "Remove project" : "Save changes"}
          onConfirm={variant === "default" ? undefined : () => new Promise<void>((resolve) => setTimeout(() => (setDone(variant === "alert" ? "Project removed." : "Details saved."), resolve()), 600))}
          footer={variant === "default" ? <DialogClose render={<Button variant="primary" />}>Done</DialogClose> : undefined}
        >
          {variant === "default" && <p>The field operations team is preparing the site survey.</p>}
          {variant === "sheet" && <div className="flex flex-col gap-4">
            <Field label="Project name"><Input defaultValue="North Campus rollout" /></Field>
            <Field label="Notes"><Textarea defaultValue="Phase one covers the main building." /></Field>
          </div>}
        </Dialog>
        <span role="status" className="text-label text-muted">{done}</span>
      </div>
    </div>
  )
}

function MenuPreview() {
  const [variant, setVariant] = useState<"dropdown" | "context">("dropdown")
  const [status, setStatus] = useState("")
  const [archived, setArchived] = useState(false)
  const [sort, setSort] = useState("updated")
  const items = [
    { label: "Edit", icon: <Pencil aria-hidden />, shortcut: "E", onSelect: () => setStatus("Editing project.") },
    { label: "Duplicate", icon: <Copy aria-hidden />, onSelect: () => setStatus("Project duplicated.") },
    { label: "Move to", icon: <FolderOpen aria-hidden />, items: [{ label: "Field services", onSelect: () => setStatus("Moved to Field services.") }, { label: "North operations", onSelect: () => setStatus("Moved to North operations.") }] },
    "separator" as const,
    { heading: "View" },
    { label: "Show archived", checked: archived, onCheckedChange: setArchived },
    { radio: { value: sort, onValueChange: setSort, options: [{ value: "updated", label: "Sort by updated" }, { value: "name", label: "Sort by name" }] } },
    "separator" as const,
    { label: "Archive", icon: <Archive aria-hidden />, danger: true, onSelect: () => setStatus("Project archived.") },
  ]
  return (
    <div className="flex flex-col gap-3">
      <VariantBar label="Variant" options={["dropdown", "context"] as const as ("dropdown" | "context")[]} value={variant} onValueChange={setVariant} />
      <div className="flex flex-wrap items-center gap-3">
        {variant === "dropdown"
          ? <Menu align="start" trigger={<Button>Project actions <ChevronDown aria-hidden /></Button>} items={items} />
          : <Menu variant="context" items={items} trigger={<div className="grid h-28 w-full max-w-sm place-items-center rounded-card border border-dashed border-strong bg-subtle text-muted select-none">Right-click or long-press here</div>} />}
        <span role="status" className="text-muted">{status}</span>
      </div>
    </div>
  )
}

function PopoverPreview() {
  const [openOn, setOpenOn] = useState<"click" | "hover">("click")
  return (
    <div className="flex flex-col gap-3">
      <VariantBar label="Open on" options={["click", "hover"] as ("click" | "hover")[]} value={openOn} onValueChange={setOpenOn} />
      {openOn === "click"
        ? <Popover title="Invite to project" trigger={<Button><UserPlus aria-hidden /> Invite</Button>} className="w-72">
          <div className="flex flex-col gap-2 pt-1"><Input placeholder="name@example.com" aria-label="Email" /><Button variant="primary" className="self-end">Send invite</Button></div>
        </Popover>
        : <p>Owned by <Popover openOn="hover" trigger={<button type="button" className="font-medium text-accent-fg underline decoration-dotted underline-offset-2 outline-none focus-visible:outline-2 focus-visible:outline-focus">Maya Chen</button>} className="w-64">
          <div className="flex items-start gap-3"><Avatar name="Maya Chen" size="lg" /><div className="flex flex-col"><span className="font-medium">Maya Chen</span><span className="text-label text-muted">Operations lead · North operations</span><span className="pt-1 text-label text-muted">12 active projects</span></div></div>
        </Popover> since March.</p>}
    </div>
  )
}

function ToggleGroupPreview() {
  const [styles, setStyles] = useState<("bold" | "italic" | "underline")[]>(["bold"])
  const [align, setAlign] = useState<("left" | "center" | "right")[]>(["left"])
  const [days, setDays] = useState<string[]>(["mon", "wed", "fri"])
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <ToggleGroup multiple aria-label="Text style" value={styles} onValueChange={setStyles} options={[
          { value: "bold", icon: <Bold aria-hidden />, "aria-label": "Bold" },
          { value: "italic", icon: <Italic aria-hidden />, "aria-label": "Italic" },
          { value: "underline", icon: <Underline aria-hidden />, "aria-label": "Underline" },
        ]} />
        <ToggleGroup variant="ghost" aria-label="Alignment" value={align} onValueChange={setAlign} options={[
          { value: "left", icon: <AlignLeft aria-hidden />, "aria-label": "Align left" },
          { value: "center", icon: <AlignCenter aria-hidden />, "aria-label": "Align center" },
          { value: "right", icon: <AlignRight aria-hidden />, "aria-label": "Align right" },
        ]} />
      </div>
      <ToggleGroup multiple size="xs" aria-label="Crew days" value={days} onValueChange={setDays}
        options={["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((d) => ({ value: d, label: d[0].toUpperCase() + d.slice(1) }))} />
    </div>
  )
}

function InputGroupPreview() {
  const [query, setQuery] = useState("")
  return (
    <div className="grid max-w-xl gap-4 sm:grid-cols-2">
      <Field label="Search projects"><SearchInput value={query} onValueChange={setQuery} hotkey="/" placeholder="Search…" /></Field>
      <Field label="Password"><PasswordInput defaultValue="correct horse" /></Field>
      <Field label="Website"><InputGroup start={<span>https://</span>} end={<Link2 />} placeholder="example.com" /></Field>
      <Field label="Invite link"><InputGroup readOnly defaultValue="https://jns.dev/i/2041" end={<CopyButton size="xs" variant="ghost" text="https://jns.dev/i/2041" label="Copy invite link" />} /></Field>
    </div>
  )
}

function OtpPreview() {
  const [code, setCode] = useState("")
  const [status, setStatus] = useState("")
  return (
    <div className="flex flex-col gap-2">
      <Field label="Verification code" hint="Enter the 6-digit code we sent to maya@example.com.">
        <OtpInput groups={[3, 3]} value={code} onValueChange={(v) => (setCode(v), setStatus(""))} onComplete={(v) => setStatus(`Verifying ${v}…`)} />
      </Field>
      <span role="status" className="text-label text-muted">{status}</span>
    </div>
  )
}

const commands = (note: (text: string) => void): CommandItem[] => [
  { id: "new", group: "Projects", label: "New project", icon: <Plus />, shortcut: "mod+shift+n", onSelect: () => note("Creating a project.") },
  { id: "search", group: "Projects", label: "Search projects", icon: <FolderOpen />, keywords: ["find"], onSelect: () => note("Searching projects.") },
  { id: "archive", group: "Projects", label: "Archive project", icon: <Archive />, keywords: ["delete", "remove"], onSelect: () => note("Project archived.") },
  { id: "invite", group: "Workspace", label: "Invite member", icon: <UserPlus />, onSelect: () => note("Inviting a member.") },
  { id: "settings", group: "Workspace", label: "Open settings", icon: <Settings />, shortcut: "mod+,", onSelect: () => note("Opening settings.") },
  { id: "automations", group: "Workspace", label: "Automations", icon: <Zap />, hint: "Soon", disabled: true, onSelect: () => {} },
]

function CommandPreview() {
  const [status, setStatus] = useState("")
  const items = commands(setStatus)
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <CommandDialog items={items} trigger={<Button>Open palette <Kbd hotkey="mod+k" /></Button>} />
        <span role="status" className="text-muted">{status}</span>
      </div>
      <Panel className="h-72 max-w-md overflow-hidden"><Command items={items} aria-label="Inline commands" /></Panel>
    </div>
  )
}

function HooksPreview() {
  const [presses, setPresses] = useState(0)
  useHotkey("shift+?", () => setPresses((n) => n + 1))
  const wide = useMediaQuery("(min-width: 768px)")
  const [copied, copy] = useCopyToClipboard()
  const [text, setText] = useState("")
  const debounced = useDebouncedValue(text, 400)
  return (
    <div className="flex flex-col gap-3">
      <Item variant="muted" size="sm" title={<code>useHotkey("shift+?")</code>} description="Press Shift + ? anywhere outside a field." actions={<Badge tone="accent">{presses} presses</Badge>} />
      <Item variant="muted" size="sm" title={<code>useMediaQuery("(min-width: 768px)")</code>} description="Resize the window." actions={<Badge tone={wide ? "success" : "neutral"}>{wide ? "Wide" : "Narrow"}</Badge>} />
      <Item variant="muted" size="sm" title={<code>useCopyToClipboard()</code>} description="Copied stays true for 1.5 s." actions={<Button size="xs" onClick={() => copy("PRJ-2041")}>{copied ? "Copied" : "Copy ID"}</Button>} />
      <Field label="useDebouncedValue(text, 400)" hint={`Debounced: “${debounced}”`}><Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type quickly…" /></Field>
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
