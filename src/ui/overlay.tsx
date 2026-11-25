"use client"

import * as React from "react"
import { Dialog as BaseDialog } from "@base-ui/react/dialog"
import { AlertDialog as BaseAlertDialog } from "@base-ui/react/alert-dialog"
import { Menu as BaseMenu } from "@base-ui/react/menu"
import { ContextMenu as BaseContextMenu } from "@base-ui/react/context-menu"
import { Popover as BasePopover } from "@base-ui/react/popover"
import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip"
import { Check, ChevronRight, X } from "lucide-react"

import { Button, buttonClass, type ButtonVariant } from "./button"
import { cx, present } from "./cx"
import { useControllableState } from "./hooks"
import { itemClass, popupClass } from "./select"

// ---- Dialog ----

const backdrop = "fixed inset-0 z-50 bg-overlay transition-opacity duration-150 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0"
const surface = "fixed z-50 flex flex-col bg-surface text-fg shadow-dialog outline-none"
const centered =
  "top-1/2 left-1/2 max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-dialog transition-[opacity,transform] duration-150 data-[starting-style]:opacity-0 data-[starting-style]:scale-[0.98] data-[ending-style]:opacity-0"

// sheet: the whole screen on a phone (a form to fill in the field), a regular dialog from md up.
const widths = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  sheet: "max-md:inset-0 max-md:h-dvh max-md:max-h-dvh max-md:w-full max-md:translate-x-0 max-md:translate-y-0 max-md:rounded-none md:max-w-lg",
}

export type DialogVariant = "default" | "alert" | "sheet"
export type SheetSide = "right" | "left" | "bottom"

const sides: Record<SheetSide, string> = {
  right: "inset-y-0 right-0 h-dvh w-full border-l border-divider data-[starting-style]:translate-x-full data-[ending-style]:translate-x-full",
  left: "inset-y-0 left-0 h-dvh w-full border-r border-divider data-[starting-style]:-translate-x-full data-[ending-style]:-translate-x-full",
  bottom: "inset-x-0 bottom-0 max-h-[85dvh] rounded-t-dialog border-t border-divider data-[starting-style]:translate-y-full data-[ending-style]:translate-y-full",
}
const sheetWidths = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-xl", sheet: "max-w-md" }

export type DialogProps = {
  /**
   * default: a short task; dismissed by Escape, the backdrop or the close button.
   * alert: asks before something consequential; only its buttons close it (`role="alertdialog"`, no backdrop dismiss).
   * sheet: slides in from an edge (`side`) for a longer side task that keeps the page in view: filters, a quick edit, details.
   */
  variant?: DialogVariant
  side?: SheetSide
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactElement
  title: React.ReactNode
  description?: React.ReactNode
  children?: React.ReactNode
  /** Replaces the footer. Without it, `onConfirm` gives a Cancel + confirm footer. */
  footer?: React.ReactNode
  size?: keyof typeof widths
  closeLabel?: string
  /** May return a promise: the dialog shows a spinner, stays open on error and shows the message. */
  onConfirm?: () => unknown
  confirmLabel?: React.ReactNode
  cancelLabel?: React.ReactNode
  /** The confirm button's variant. Defaults to danger for alerts and primary otherwise. */
  confirmVariant?: ButtonVariant
}

/**
 * Every modal surface in one component: a dialog, an alert (confirmation) and a sheet are the same thing with a different
 * `variant`. Records never open in one: they have pages. Controlled with `open` + `onOpenChange`, or give it a `trigger`.
 */
export function Dialog({
  variant = "default",
  side = "right",
  open,
  defaultOpen = false,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  footer,
  size,
  closeLabel = "Close",
  onConfirm,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmVariant,
}: DialogProps) {
  const alert = variant === "alert"
  const [isOpen, setOpen] = useControllableState(open, defaultOpen, onOpenChange)
  const [busy, setBusy] = React.useState(false)
  // What went wrong on the last confirm, shown in the dialog so it isn't lost when nothing else reports it.
  const [error, setError] = React.useState<string | null>(null)
  const change = (o: boolean) => {
    if (busy) return
    setError(null)
    setOpen(o)
  }
  const confirm = async () => {
    setBusy(true)
    setError(null)
    try {
      await onConfirm?.()
      setBusy(false)
      setOpen(false)
    } catch (e) {
      setBusy(false)
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  // An alert dialog differs only in its root and trigger: the other parts are the dialog's.
  const Root = alert ? BaseAlertDialog.Root : BaseDialog.Root
  const Trigger = alert ? BaseAlertDialog.Trigger : BaseDialog.Trigger
  const popup =
    variant === "sheet"
      ? cx(surface, "transition-transform duration-200 ease-out", sides[side], side !== "bottom" && sheetWidths[size ?? "md"])
      : cx(surface, centered, widths[size ?? (alert ? "sm" : "md")])
  const actions =
    footer ??
    (onConfirm && (
      <>
        <BaseDialog.Close render={<Button variant="secondary" disabled={busy} />}>{cancelLabel}</BaseDialog.Close>
        <Button variant={confirmVariant ?? (alert ? "danger" : "primary")} loading={busy} onClick={confirm}>
          {confirmLabel}
        </Button>
      </>
    ))

  return (
    <Root open={isOpen} onOpenChange={change}>
      {trigger && <Trigger render={trigger} />}
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className={backdrop} />
        <BaseDialog.Popup className={popup} data-variant={variant}>
          {variant === "sheet" && side === "bottom" && <span aria-hidden className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-control" />}
          <div className={cx("flex items-start gap-3 px-5 pt-4", alert ? "pb-1" : "pb-3")}>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <BaseDialog.Title className="text-heading font-semibold">{title}</BaseDialog.Title>
              {description && <BaseDialog.Description className="text-body text-muted">{description}</BaseDialog.Description>}
            </div>
            {!alert && (
              <BaseDialog.Close className={buttonClass({ variant: "ghost", size: "xs", icon: true, className: "-mr-1.5" })} aria-label={closeLabel}>
                <X />
              </BaseDialog.Close>
            )}
          </div>
          {(children || error) && (
            <div className={cx("min-h-0 flex-1 overflow-y-auto px-5", alert ? "pt-2 pb-4" : "pb-4")}>
              {children}
              {error && (
                <p role="alert" className={cx("text-body text-danger-fg", children ? "pt-2" : undefined)}>
                  {error}
                </p>
              )}
            </div>
          )}
          {alert && !children && !error && <div className="pb-3" />}
          {actions && <div className={cx("flex items-center justify-end gap-2 border-t border-divider px-5 py-3", variant === "sheet" && "mt-auto")}>{actions}</div>}
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </Root>
  )
}

/** Closes the dialog it's in: <DialogClose render={<Button>Cancel</Button>} />. */
export const DialogClose = BaseDialog.Close

/** @deprecated Use `<Dialog variant="alert">`. Kept so existing pages keep compiling. */
export function ConfirmDialog({ variant = "danger", ...props }: Omit<DialogProps, "variant" | "confirmVariant" | "onConfirm" | "confirmLabel" | "cancelLabel"> & { onConfirm: () => unknown; confirmLabel: React.ReactNode; cancelLabel: React.ReactNode; variant?: ButtonVariant }) {
  return <Dialog {...props} variant="alert" confirmVariant={variant} />
}

// ---- Menu ----

type Action = { label: React.ReactNode; icon?: React.ReactNode; onSelect?: () => void; danger?: boolean; disabled?: boolean; shortcut?: string; render?: React.ReactElement; href?: string }

export type MenuEntry =
  | Action
  | "separator"
  | { heading: React.ReactNode }
  /** A toggled setting that stays in the menu: "Show archived". The menu stays open. */
  | { label: React.ReactNode; checked: boolean; onCheckedChange: (checked: boolean) => void; disabled?: boolean }
  /** One of several: "Sort by". */
  | { radio: { value: string; onValueChange: (value: string) => void; options: { value: string; label: React.ReactNode; disabled?: boolean }[] } }
  /** A nested menu: "Move to ›". */
  | { label: React.ReactNode; icon?: React.ReactNode; items: (MenuEntry | false | null | undefined)[]; disabled?: boolean }

const indicator = "absolute left-2 flex [&_svg]:!text-fg"

function MenuEntries({ items }: { items: (MenuEntry | false | null | undefined)[] }) {
  return items.filter(present).map((item, i) => {
    if (item === "separator") return <BaseMenu.Separator key={i} className="my-1 h-px bg-divider" />
    if ("heading" in item)
      return (
        <div key={i} className="px-2 pt-1.5 pb-1 text-micro font-medium text-muted">
          {item.heading}
        </div>
      )
    if ("radio" in item)
      return (
        <BaseMenu.RadioGroup key={i} value={item.radio.value} onValueChange={(v) => item.radio.onValueChange(v as string)}>
          {item.radio.options.map((o) => (
            <BaseMenu.RadioItem key={o.value} value={o.value} disabled={o.disabled} closeOnClick={false} className={cx(itemClass, "pl-7")}>
              <BaseMenu.RadioItemIndicator className={indicator}>
                <span className="mx-1 size-1.5 rounded-full bg-fg" />
              </BaseMenu.RadioItemIndicator>
              {o.label}
            </BaseMenu.RadioItem>
          ))}
        </BaseMenu.RadioGroup>
      )
    if ("checked" in item)
      return (
        <BaseMenu.CheckboxItem key={i} checked={item.checked} onCheckedChange={item.onCheckedChange} disabled={item.disabled} className={cx(itemClass, "pl-7")}>
          <BaseMenu.CheckboxItemIndicator className={indicator}>
            <Check />
          </BaseMenu.CheckboxItemIndicator>
          {item.label}
        </BaseMenu.CheckboxItem>
      )
    if ("items" in item)
      return (
        <BaseMenu.SubmenuRoot key={i}>
          <BaseMenu.SubmenuTrigger disabled={item.disabled} className={cx(itemClass, "data-[popup-open]:bg-hover")}>
            {item.icon}
            <span className="flex-1">{item.label}</span>
            <ChevronRight className="size-3.5" />
          </BaseMenu.SubmenuTrigger>
          <BaseMenu.Portal>
            <BaseMenu.Positioner sideOffset={2} alignOffset={-4} className="z-50">
              <BaseMenu.Popup className={cx(popupClass, "min-w-40")}>
                <MenuEntries items={item.items} />
              </BaseMenu.Popup>
            </BaseMenu.Positioner>
          </BaseMenu.Portal>
        </BaseMenu.SubmenuRoot>
      )
    return (
      <BaseMenu.Item
        key={i}
        disabled={item.disabled}
        onClick={item.onSelect}
        render={item.render ?? (item.href ? <a href={item.href} /> : undefined)}
        className={cx(itemClass, item.danger && "text-danger-fg [&_svg]:!text-danger-fg")}
      >
        {item.icon}
        <span className="flex-1">{item.label}</span>
        {item.shortcut && <span className="text-micro text-muted">{item.shortcut}</span>}
      </BaseMenu.Item>
    )
  })
}

/**
 * A menu of actions. `variant="dropdown"` opens from the `trigger` button; `variant="context"` opens on right click
 * (or long press) anywhere inside the `trigger` element, at the pointer. Both take the same `items`, so a row can offer
 * its actions both ways. Items with `render` (a router Link) or `href` navigate.
 */
export function Menu({
  variant = "dropdown",
  trigger,
  items,
  align = "end",
  side = "bottom",
}: {
  variant?: "dropdown" | "context"
  trigger: React.ReactElement
  items: (MenuEntry | false | null | undefined)[]
  align?: "start" | "center" | "end"
  side?: "top" | "bottom" | "left" | "right"
}) {
  const popup = (
    <BaseMenu.Popup className={cx(popupClass, "min-w-44")}>
      <MenuEntries items={items} />
    </BaseMenu.Popup>
  )
  if (variant === "context")
    return (
      <BaseContextMenu.Root>
        <BaseContextMenu.Trigger render={trigger} />
        <BaseContextMenu.Portal>
          <BaseContextMenu.Positioner className="z-50">{popup}</BaseContextMenu.Positioner>
        </BaseContextMenu.Portal>
      </BaseContextMenu.Root>
    )
  return (
    <BaseMenu.Root>
      <BaseMenu.Trigger render={trigger} />
      <BaseMenu.Portal>
        <BaseMenu.Positioner sideOffset={4} align={align} side={side} className="z-50">
          {popup}
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    </BaseMenu.Root>
  )
}

// ---- Popover ----

/**
 * Details or a small form beside its trigger. `openOn="hover"` also opens it on hover after `delay` ms (a hover card:
 * a person's details on their name); a click or Enter still opens it, so it works without a pointer.
 */
export function Popover({
  trigger,
  children,
  align = "start",
  side = "bottom",
  className,
  open,
  onOpenChange,
  openOn = "click",
  delay = 400,
  title,
}: {
  trigger: React.ReactElement
  children: React.ReactNode
  align?: "start" | "center" | "end"
  side?: "top" | "bottom" | "left" | "right"
  className?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  openOn?: "click" | "hover"
  delay?: number
  /** A heading that names the popup for assistive tech. */
  title?: React.ReactNode
}) {
  return (
    <BasePopover.Root open={open} onOpenChange={onOpenChange}>
      <BasePopover.Trigger render={trigger} openOnHover={openOn === "hover"} delay={delay} />
      <BasePopover.Portal>
        <BasePopover.Positioner sideOffset={6} align={align} side={side} className="z-50">
          <BasePopover.Popup
            className={cx(
              "max-w-[calc(100vw-2rem)] origin-(--transform-origin) rounded-card border border-border bg-surface p-3 text-body shadow-popover outline-none transition-[opacity,transform] duration-100 data-[starting-style]:scale-[0.98] data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
              className,
            )}
          >
            {title && <BasePopover.Title className="mb-1 text-body font-semibold">{title}</BasePopover.Title>}
            {children}
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  )
}

// ---- Tooltip ----

export const TooltipProvider = BaseTooltip.Provider

export function Tooltip({ content, children, side = "top", shortcut }: { content: React.ReactNode; children: React.ReactElement; side?: "top" | "bottom" | "left" | "right"; shortcut?: React.ReactNode }) {
  if (!content) return children
  return (
    <BaseTooltip.Root>
      <BaseTooltip.Trigger render={children} />
      <BaseTooltip.Portal>
        <BaseTooltip.Positioner sideOffset={6} side={side} className="z-50">
          <BaseTooltip.Popup className="flex max-w-xs items-center gap-2 rounded-control bg-fg px-2 py-1 text-label text-white shadow-popover transition-opacity duration-100 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 dark:bg-active dark:text-fg">
            {content}
            {shortcut && <span className="text-white/60 dark:text-muted">{shortcut}</span>}
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  )
}
