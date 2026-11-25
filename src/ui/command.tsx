"use client"

import * as React from "react"
import { Dialog as BaseDialog } from "@base-ui/react/dialog"
import { Search } from "lucide-react"

import { Kbd } from "./button"
import { cx } from "./cx"
import { useControllableState, useHotkey } from "./hooks"

export type CommandItem = {
  id: string
  label: string
  /** Items with the same group are listed together under it, in the order the groups first appear. */
  group?: string
  icon?: React.ReactNode
  /** A hotkey string ("mod+shift+n") shown on the right. Bind it with `useHotkey` separately. */
  shortcut?: string
  /** Other words that should find it: "delete" for "Remove project". */
  keywords?: string[]
  hint?: React.ReactNode
  disabled?: boolean
  onSelect: () => void
}

/** How well `query` matches `text`: a prefix beats a word start beats a substring beats letters in order; 0 is no match. */
export function commandScore(text: string, query: string) {
  const t = text.toLowerCase()
  const q = query.toLowerCase().trim()
  if (!q) return 1
  if (t.startsWith(q)) return 4
  if (t.includes(` ${q}`)) return 3
  if (t.includes(q)) return 2
  let at = 0
  for (const ch of q) {
    at = t.indexOf(ch, at) + 1
    if (!at) return 0
  }
  return 1
}

/**
 * A searchable list of commands, driven from its input: arrows move, Enter runs, Home / End jump. The input is a
 * combobox over a listbox, so screen readers announce the highlighted command. Use <CommandDialog> for a ⌘K palette.
 */
export function Command({
  items,
  placeholder = "Type a command or search…",
  emptyText = "No results.",
  onRun,
  className,
  autoFocus,
  "aria-label": ariaLabel = "Commands",
}: {
  items: CommandItem[]
  placeholder?: string
  emptyText?: React.ReactNode
  /** Called after an item's onSelect: a dialog closes here. */
  onRun?: (item: CommandItem) => void
  className?: string
  autoFocus?: boolean
  "aria-label"?: string
}) {
  const [query, setQuery] = React.useState("")
  const [active, setActive] = React.useState(0)
  const id = React.useId()
  const listRef = React.useRef<HTMLDivElement>(null)

  const results = React.useMemo(() => {
    const scored = items
      .map((item, index) => ({ item, index, score: Math.max(commandScore(item.label, query), ...(item.keywords ?? []).map((k) => commandScore(k, query) - 1)) }))
      .filter((r) => r.score > 0)
    if (query) scored.sort((a, b) => b.score - a.score || a.index - b.index)
    // Keep groups together, in first-seen order, so arrow keys follow what's on screen.
    const order = [...new Set(scored.map((r) => r.item.group ?? ""))]
    return order.flatMap((g) => scored.filter((r) => (r.item.group ?? "") === g).map((r) => r.item))
  }, [items, query])

  const enabled = results.map((r, i) => (r.disabled ? -1 : i)).filter((i) => i >= 0)
  const current = enabled.includes(active) ? active : (enabled[0] ?? -1)

  React.useEffect(() => {
    listRef.current?.querySelector(`[data-index="${current}"]`)?.scrollIntoView({ block: "nearest" })
  }, [current])

  const run = (item: CommandItem | undefined) => {
    if (!item || item.disabled) return
    item.onSelect()
    onRun?.(item)
  }
  const move = (by: number | "first" | "last") => {
    if (!enabled.length) return
    const at = enabled.indexOf(current)
    const next = by === "first" ? 0 : by === "last" ? enabled.length - 1 : (at + by + enabled.length) % enabled.length
    setActive(enabled[next])
  }

  let lastGroup: string | undefined
  return (
    <div className={cx("flex min-h-0 flex-col", className)}>
      <div className="flex h-11 shrink-0 items-center gap-2 border-b border-divider px-3">
        <Search className="size-4 shrink-0 text-muted" aria-hidden />
        <input
          role="combobox"
          aria-expanded
          aria-controls={`${id}-list`}
          aria-activedescendant={current >= 0 ? `${id}-${current}` : undefined}
          aria-autocomplete="list"
          aria-label={ariaLabel}
          autoFocus={autoFocus}
          value={query}
          placeholder={placeholder}
          onChange={(e) => {
            setQuery(e.target.value)
            setActive(0)
          }}
          onKeyDown={(e) => {
            const keys: Record<string, () => void> = {
              ArrowDown: () => move(1),
              ArrowUp: () => move(-1),
              Home: () => move("first"),
              End: () => move("last"),
              Enter: () => run(results[current]),
            }
            if (!keys[e.key] || e.nativeEvent.isComposing) return
            e.preventDefault()
            keys[e.key]()
          }}
          className="h-full min-w-0 flex-1 bg-transparent text-body outline-none placeholder:text-faint"
        />
      </div>
      <div ref={listRef} id={`${id}-list`} role="listbox" aria-label={ariaLabel} className="min-h-0 flex-1 overflow-y-auto p-1">
        {results.length === 0 && <p className="px-3 py-8 text-center text-body text-muted">{emptyText}</p>}
        {results.map((item, i) => {
          const heading = item.group && item.group !== lastGroup ? item.group : null
          lastGroup = item.group
          return (
            <React.Fragment key={item.id}>
              {heading && (
                <div role="presentation" className="px-2 pt-2 pb-1 text-micro font-medium text-muted">
                  {heading}
                </div>
              )}
              <div
                id={`${id}-${i}`}
                role="option"
                data-index={i}
                aria-selected={i === current}
                aria-disabled={item.disabled || undefined}
                data-highlighted={i === current || undefined}
                onPointerMove={() => !item.disabled && i !== current && setActive(i)}
                onClick={() => run(item)}
                className="flex h-8 cursor-default items-center gap-2 rounded-[4px] px-2 text-body select-none data-[highlighted]:bg-hover aria-disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted"
              >
                {item.icon}
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {item.hint && <span className="text-label text-muted">{item.hint}</span>}
                {item.shortcut && <Kbd hotkey={item.shortcut} aria-hidden />}
              </div>
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

/**
 * A command palette: <Command> in a dialog that opens on `hotkey` (⌘K / Ctrl+K by default) from anywhere on the page,
 * and closes once a command runs. Opening again starts from an empty search.
 */
export function CommandDialog({
  open,
  onOpenChange,
  hotkey = "mod+k",
  title = "Command palette",
  trigger,
  ...props
}: React.ComponentProps<typeof Command> & { open?: boolean; onOpenChange?: (open: boolean) => void; hotkey?: string | false; title?: string; trigger?: React.ReactElement }) {
  const [isOpen, setOpen] = useControllableState(open, false, onOpenChange)
  useHotkey(hotkey || "", () => setOpen(!isOpen), { enabled: !!hotkey })
  return (
    <BaseDialog.Root open={isOpen} onOpenChange={setOpen}>
      {trigger && <BaseDialog.Trigger render={trigger} />}
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="fixed inset-0 z-50 bg-overlay transition-opacity duration-150 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0" />
        <BaseDialog.Popup className="fixed top-[12dvh] left-1/2 z-50 flex max-h-[min(440px,76dvh)] w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 flex-col overflow-hidden rounded-dialog bg-surface text-fg shadow-dialog outline-none transition-[opacity,transform] duration-150 data-[starting-style]:scale-[0.98] data-[starting-style]:opacity-0 data-[ending-style]:opacity-0">
          <BaseDialog.Title className="sr-only">{title}</BaseDialog.Title>
          <Command autoFocus {...props} onRun={(item) => (setOpen(false), props.onRun?.(item))} />
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  )
}
