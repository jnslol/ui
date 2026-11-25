"use client"

import * as React from "react"

/**
 * State that a caller may control (`value` + `onChange`) or leave to the component (`defaultValue`).
 * Every component with an optional `open` / `value` prop goes through this, so both modes behave the same.
 */
export function useControllableState<T>(value: T | undefined, defaultValue: T, onChange?: (value: T) => void) {
  const [own, setOwn] = React.useState(defaultValue)
  const controlled = value !== undefined
  const current = controlled ? value : own
  const set = React.useCallback(
    (next: T) => {
      if (!controlled) setOwn(next)
      onChange?.(next)
    },
    [controlled, onChange],
  )
  return [current, set] as const
}

const isMac = () => typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)

/** "mod+k" → ["⌘", "K"] on a Mac, ["Ctrl", "K"] elsewhere. For <Kbd hotkey>. */
export function formatHotkey(combo: string) {
  const mac = isMac()
  const names: Record<string, string> = mac
    ? { mod: "⌘", meta: "⌘", ctrl: "⌃", alt: "⌥", shift: "⇧", enter: "↵", escape: "Esc", backspace: "⌫" }
    : { mod: "Ctrl", meta: "Win", ctrl: "Ctrl", alt: "Alt", shift: "Shift", enter: "Enter", escape: "Esc", backspace: "Backspace" }
  return combo.split("+").map((key) => names[key.toLowerCase()] ?? (key.length === 1 ? key.toUpperCase() : key[0].toUpperCase() + key.slice(1)))
}

function matches(event: KeyboardEvent, combo: string) {
  const keys = combo.toLowerCase().split("+")
  const key = keys[keys.length - 1]
  const mod = keys.includes("mod")
  const want = {
    meta: keys.includes("meta") || (mod && isMac()),
    ctrl: keys.includes("ctrl") || (mod && !isMac()),
    alt: keys.includes("alt"),
    shift: keys.includes("shift"),
  }
  return (
    event.metaKey === want.meta &&
    event.ctrlKey === want.ctrl &&
    event.altKey === want.alt &&
    event.shiftKey === want.shift &&
    (event.key.toLowerCase() === key || event.code.toLowerCase() === `key${key}`)
  )
}

const typing = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))

/**
 * Runs `handler` on a keyboard shortcut anywhere on the page: "mod+k", "shift+?", "/".
 * Shortcuts without a modifier are ignored while typing in a field, so "/" still types a slash.
 */
export function useHotkey(combo: string | string[], handler: (event: KeyboardEvent) => void, { enabled = true }: { enabled?: boolean } = {}) {
  const ref = React.useRef(handler)
  React.useEffect(() => {
    ref.current = handler
  })
  const combos = (Array.isArray(combo) ? combo : [combo]).join(",")
  React.useEffect(() => {
    if (!enabled) return
    const list = combos.split(",")
    const onKey = (event: KeyboardEvent) => {
      const hit = list.find((c) => matches(event, c))
      if (!hit) return
      const bare = !/(mod|meta|ctrl|alt)\+/.test(hit)
      if (bare && typing(event.target)) return
      event.preventDefault()
      ref.current(event)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [combos, enabled])
}

/** Whether a media query matches, e.g. `useMediaQuery("(min-width: 768px)")`. False on the server. */
export function useMediaQuery(query: string) {
  return React.useSyncExternalStore(
    (callback) => {
      const list = window.matchMedia(query)
      list.addEventListener("change", callback)
      return () => list.removeEventListener("change", callback)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

/** `[copied, copy]`: `copy(text)` writes to the clipboard and `copied` stays true for `timeout` ms. */
export function useCopyToClipboard(timeout = 1500) {
  const [copied, setCopied] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  React.useEffect(() => () => clearTimeout(timer.current), [])
  const copy = React.useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text)
      } catch {
        return false
      }
      setCopied(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), timeout)
      return true
    },
    [timeout],
  )
  return [copied, copy] as const
}

/** The value, once it has stopped changing for `delay` ms: a search box that queries the server. */
export function useDebouncedValue<T>(value: T, delay = 250) {
  const [debounced, setDebounced] = React.useState(value)
  React.useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

/** Open state with named helpers, for a dialog or drawer opened from somewhere other than its trigger. */
export function useDisclosure(initial = false) {
  const [open, setOpen] = React.useState(initial)
  return React.useMemo(
    () => ({ open, setOpen, onOpen: () => setOpen(true), onClose: () => setOpen(false), onToggle: () => setOpen((o) => !o) }),
    [open],
  )
}
