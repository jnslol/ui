import { useState, type ReactNode } from "react"
import { Info, Plus, Trash2 } from "lucide-react"
import { Badge, Callout, EmptyState, Skeleton, type Tone } from "./ui/staff-display"
import { Button, Kbd, type ButtonVariant } from "./ui/staff-button"
import { Combobox, type ComboItem } from "./ui/staff-combobox"
import { CheckboxField, Field, Input, Switch, Textarea } from "./ui/staff-form"
import { Page, PageHeader, Panel, Section } from "./ui/staff-layout"
import { ConfirmDialog, Dialog, DialogClose, Menu, Popover, Tooltip } from "./ui/staff-overlay"
import { Select } from "./ui/staff-select"

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

function Specimen({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  const url = new URL(`r/${id}.json`, document.baseURI)
  return (
    <Section title={title} actions={<a className="text-label text-accent-fg hover:underline" href={url.href}>Registry JSON</a>}>
      <Panel className="flex flex-col gap-4 p-4">{children}</Panel>
      <InstallCommand command={`npx shadcn@latest add "${url.href}"`} />
    </Section>
  )
}

export function Components() {
  const [plan, setPlan] = useState("standard")
  const [person, setPerson] = useState<ComboItem | null>(null)
  const [overlayResult, setOverlayResult] = useState("")
  return (
    <Page width="narrow">
      <PageHeader title="Components" description="Staff components with dense controls, semantic status colors, and dark mode." />
      <Callout tone="info" icon={<Info aria-hidden />} title="Use the jns ui theme">
        Follow the <a href="#/setup" className="font-medium text-accent-fg underline">setup instructions</a> to add Tailwind v4 and import the tokens once.
      </Callout>
      <Specimen id="jns-theme" title="Theme tokens">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[["Page", "bg-bg"], ["Surface", "bg-surface"], ["Subtle", "bg-subtle"], ["Accent", "bg-accent"]].map(([name, color]) => (
            <div className="flex flex-col gap-1 text-label font-medium" key={name}><span className={`h-10 rounded-control border border-divider ${color}`} />{name}</div>
          ))}
        </div>
        <p className="text-display font-semibold">Inter Variable</p>
        <p className="font-mono text-label">JetBrains Mono Variable · 0123456789</p>
      </Specimen>
      <Specimen id="jns-button" title="Buttons">
        {(["md", "sm", "xs"] as const).map((size) => (
          <div className="flex flex-wrap items-center gap-2" key={size}>
            <span className="w-8 text-label text-muted">{size}</span>
            {variants.map((variant) => <Button key={variant} variant={variant} size={size}>{variant}</Button>)}
          </div>
        ))}
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="primary" loading>Saving</Button>
          <Button disabled>Disabled</Button>
          <Button><Plus /> Add item</Button>
          <Kbd>Ctrl K</Kbd>
        </div>
      </Specimen>
      <Specimen id="jns-display" title="Status and feedback">
        <div className="flex flex-wrap gap-2">
          {tones.map((tone) => <Badge key={tone} tone={tone} dot>{tone}</Badge>)}
        </div>
        <Callout tone="warning" title="Review required">Assign an owner before starting the project.</Callout>
        <Skeleton className="h-4 w-40" />
        <EmptyState title="No projects found" description="Try searching for a different project." />
      </Specimen>
      <Specimen id="jns-form" title="Form controls">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Project name" hint="Use a name the team will recognize."><Input placeholder="North Campus" /></Field>
          <Field label="Owner email" error="Enter a valid email address."><Input defaultValue="maya@" /></Field>
          <Field label="Notes" className="sm:col-span-2"><Textarea /></Field>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <CheckboxField label="Include archived projects" defaultChecked />
          <span className="flex items-center gap-2"><Switch aria-label="Notifications" defaultChecked /> Notifications</span>
        </div>
      </Specimen>
      <Specimen id="jns-select" title="Select">
        <Select className="w-48" aria-label="Plan" value={plan} onValueChange={setPlan} options={[{ value: "standard", label: "Standard" }, { value: "team", label: "Team" }]} />
      </Specimen>
      <Specimen id="jns-combobox" title="Combobox">
        <Combobox className="w-48" aria-label="Project owner" items={team} value={person} onValueChange={setPerson} placeholder="Find an owner…" emptyText="No matching owners." filter />
      </Specimen>
      <Specimen id="jns-overlay" title="Dialogs, menus, and popovers">
        <div className="flex flex-wrap gap-2">
          <Dialog trigger={<Button>Dialog</Button>} title="Project preview" description="View the current project summary."
            footer={<DialogClose render={<Button variant="primary" />}>Done</DialogClose>}>
            <p>North Campus rollout is active.</p>
          </Dialog>
          <ConfirmDialog trigger={<Button variant="danger-soft"><Trash2 /> Confirm action</Button>} title="Clear the message?"
            cancelLabel="Cancel" confirmLabel="Clear message" onConfirm={() => setOverlayResult("")} />
          <Menu align="start" trigger={<Button>Actions</Button>} items={[{ label: "Mark reviewed", onSelect: () => setOverlayResult("Marked as reviewed.") }]} />
          <Popover trigger={<Button>Details</Button>}><p className="p-3">Project details appear in a popover.</p></Popover>
          <Tooltip content="Keyboard accessible tooltip"><Button variant="ghost">Tooltip</Button></Tooltip>
        </div>
        <div role="status">{overlayResult}</div>
      </Specimen>
    </Page>
  )
}
