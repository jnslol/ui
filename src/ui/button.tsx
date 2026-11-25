"use client"

import * as React from "react"
import { Button as BaseButton } from "@base-ui/react/button"
import { Check, Copy, Loader2 } from "lucide-react"

import { cx } from "./cx"
import { formatHotkey, useCopyToClipboard } from "./hooks"

export type ButtonVariant = "primary" | "secondary" | "outline" | "soft" | "ghost" | "danger" | "danger-soft" | "danger-ghost" | "link"
export type ButtonSize = "xs" | "sm" | "md" | "lg"

const base =
  "inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-control font-medium select-none transition-colors duration-100 outline-none focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-1 disabled:pointer-events-none disabled:opacity-50 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:shrink-0 [&_svg]:pointer-events-none"

const variants: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-on hover:bg-accent-hover shadow-control",
  secondary: "border border-control bg-surface text-fg hover:bg-hover hover:border-border-hover shadow-control aria-expanded:bg-hover",
  // On a tinted or subtle surface (a callout, a toolbar) where a white button would look pasted on.
  outline: "border border-control bg-transparent text-fg hover:bg-hover hover:border-border-hover aria-expanded:bg-hover",
  // The second most important action next to a primary, or the main one in a quiet area.
  soft: "bg-accent-subtle text-accent-fg hover:bg-focus-ring aria-expanded:bg-focus-ring",
  ghost: "text-fg hover:bg-hover aria-expanded:bg-hover",
  danger: "bg-danger text-white hover:bg-danger-hover shadow-control",
  "danger-soft": "border border-control bg-surface text-danger-fg hover:bg-danger-bg shadow-control",
  // A destructive action in a row or a list, where a bordered button is too heavy.
  "danger-ghost": "text-danger-fg hover:bg-danger-bg",
  link: "text-accent-fg hover:underline underline-offset-2 !h-auto !px-0",
}

// Heights: 24 in tables, 28 in toolbars and headers, 32 in forms, 36 for the one call to action on an empty or public page.
const sizes: Record<ButtonSize, string> = {
  xs: "h-6 px-2 text-label [&_svg]:size-3.5",
  sm: "h-7 px-2.5 text-body [&_svg]:size-4",
  md: "h-8 px-3 text-body [&_svg]:size-4",
  lg: "h-9 px-4 text-heading [&_svg]:size-4",
}
const iconSizes: Record<ButtonSize, string> = {
  xs: "size-6 [&_svg]:size-3.5",
  sm: "size-7 [&_svg]:size-4",
  md: "size-8 [&_svg]:size-4",
  lg: "size-9 [&_svg]:size-4",
}

/** The classes of a button, for links and other elements that look like one. */
export function buttonClass({ variant = "secondary", size = "sm", icon = false, className }: { variant?: ButtonVariant; size?: ButtonSize; icon?: boolean; className?: string } = {}) {
  return cx(base, variants[variant], icon ? iconSizes[size] : sizes[size], className)
}

export type ButtonProps = BaseButton.Props & {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Square, for an icon alone (give it an aria-label). */
  icon?: boolean
  /** Shows a spinner and disables the button. */
  loading?: boolean
}

export function Button({ variant, size, icon, loading, className, children, disabled, ...props }: ButtonProps) {
  return (
    <BaseButton
      className={buttonClass({ variant, size, icon, className: typeof className === "string" ? className : undefined })}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="animate-spin" aria-hidden />}
      {icon && loading ? null : children}
    </BaseButton>
  )
}

const kbdClass = "inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-badge border border-border bg-subtle px-1 font-sans text-micro font-medium text-muted"

/**
 * A keyboard shortcut hint: <Kbd>Esc</Kbd>, or <Kbd hotkey="mod+k" /> for the platform's keys (⌘ K on a Mac, Ctrl K elsewhere).
 * Pass the same string to `useHotkey` so the hint and the shortcut can't drift apart.
 */
export function Kbd({ className, hotkey, children, ...props }: React.ComponentProps<"kbd"> & { hotkey?: string }) {
  // The platform is only known in the browser: render the generic names first so hydration matches.
  const [keys, setKeys] = React.useState<string[] | null>(null)
  React.useEffect(() => setKeys(hotkey ? formatHotkey(hotkey) : null), [hotkey])
  if (!hotkey)
    return (
      <kbd className={cx(kbdClass, className)} {...props}>
        {children}
      </kbd>
    )
  const shown = keys ?? hotkey.split("+").map((k) => (k === "mod" ? "Ctrl" : k.length === 1 ? k.toUpperCase() : k))
  return (
    <kbd className={cx("inline-flex items-center gap-0.5 font-sans", className)} {...props}>
      {shown.map((key, i) => (
        <kbd key={i} className={kbdClass}>
          {key}
        </kbd>
      ))}
    </kbd>
  )
}

/**
 * Buttons joined into one control: a split button, a pager, zoom in / out. Children lose their inner corners and share borders.
 * Use `secondary` or `outline` buttons inside; a primary group reads as one wide button.
 */
export function ButtonGroup({ orientation = "horizontal", className, ...props }: React.ComponentProps<"div"> & { orientation?: "horizontal" | "vertical" }) {
  return (
    <div
      role="group"
      data-orientation={orientation}
      className={cx(
        "inline-flex w-fit items-stretch rounded-control shadow-control [&>*]:shadow-none [&>*:focus-visible]:relative [&>*:focus-visible]:z-10 [&>*:hover]:relative",
        orientation === "horizontal"
          ? "[&>*:not(:first-child)]:-ml-px [&>*:not(:first-child)]:rounded-l-none [&>*:not(:last-child)]:rounded-r-none"
          : "flex-col [&>*:not(:first-child)]:-mt-px [&>*:not(:first-child)]:rounded-t-none [&>*:not(:last-child)]:rounded-b-none",
        className,
      )}
      {...props}
    />
  )
}

/** A button whose click returns a promise: it shows the spinner until it settles. */
export function AsyncButton({ onClick, onError, ...props }: Omit<ButtonProps, "onClick" | "loading" | "onError"> & { onClick: () => Promise<unknown>; onError?: (error: unknown) => void }) {
  const [busy, setBusy] = React.useState(false)
  return (
    <Button
      {...props}
      loading={busy}
      onClick={async () => {
        setBusy(true)
        try {
          await onClick()
        } catch (e) {
          if (onError) onError(e)
          else throw e
        } finally {
          setBusy(false)
        }
      }}
    />
  )
}

/** Copies `text` and shows a check for a moment. */
export function CopyButton({ text, label = "Copy", copiedLabel = "Copied", size = "sm", variant }: { text: string; label?: string; copiedLabel?: string; size?: ButtonSize; variant?: ButtonVariant }) {
  const [copied, copy] = useCopyToClipboard()
  return (
    <Button type="button" size={size} variant={variant} icon aria-label={copied ? copiedLabel : label} onClick={() => copy(text)}>
      {copied ? <Check /> : <Copy />}
    </Button>
  )
}

/**
 * Press and hold to confirm: a destructive action frequent enough that a dialog every time would be noise
 * (discard a draft, end a session). The fill shows progress; letting go early cancels. Space and Enter hold too.
 */
export function HoldButton({
  onConfirm,
  duration = 1200,
  variant = "danger-soft",
  children,
  className,
  ...props
}: Omit<ButtonProps, "onClick" | "loading"> & { onConfirm: () => void; duration?: number }) {
  const [progress, setProgress] = React.useState(0)
  const frame = React.useRef(0)
  const start = React.useRef(0)
  const confirm = React.useRef(onConfirm)
  React.useEffect(() => {
    confirm.current = onConfirm
  })
  const stop = React.useCallback(() => {
    cancelAnimationFrame(frame.current)
    start.current = 0
    setProgress(0)
  }, [])
  const begin = () => {
    if (start.current) return
    start.current = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - start.current) / duration)
      setProgress(p)
      if (p < 1) frame.current = requestAnimationFrame(tick)
      else {
        stop()
        confirm.current()
      }
    }
    frame.current = requestAnimationFrame(tick)
  }
  React.useEffect(() => stop, [stop])
  const fill = variant === "danger" || variant === "primary" ? "bg-black/20" : variant.startsWith("danger") ? "bg-danger-bg" : "bg-accent-subtle"
  return (
    <Button
      type="button"
      variant={variant}
      className={cx("relative overflow-hidden", typeof className === "string" ? className : undefined)}
      onPointerDown={(e) => e.button === 0 && begin()}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onKeyDown={(e) => {
        if (e.key !== " " && e.key !== "Enter") return
        e.preventDefault()
        begin()
      }}
      onKeyUp={stop}
      onBlur={stop}
      data-holding={progress > 0 || undefined}
      {...props}
    >
      <span aria-hidden className={cx("pointer-events-none absolute inset-y-0 left-0", fill)} style={{ width: `${progress * 100}%` }} />
      <span className="relative inline-flex items-center gap-1.5">{children}</span>
    </Button>
  )
}
