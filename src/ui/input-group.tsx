"use client"

import * as React from "react"
import { Input as BaseInput } from "@base-ui/react/input"
import { NumberField as BaseNumberField } from "@base-ui/react/number-field"
import { OTPField as BaseOTPField } from "@base-ui/react/otp-field"
import { Eye, EyeOff, Minus, Plus, Search, X } from "lucide-react"

import { buttonClass, Kbd } from "./button"
import { cx } from "./cx"
import type { ControlSize, InputProps } from "./form"
import { useHotkey } from "./hooks"

const frame =
  "flex min-w-0 items-center rounded-control border border-control bg-surface text-body text-fg shadow-control transition-colors hover:border-border-hover focus-within:border-focus focus-within:ring-2 focus-within:ring-focus-ring has-[[aria-invalid=true]]:border-danger-dot has-[[data-invalid]]:border-danger-dot has-[:disabled]:opacity-50"
const heights: Record<ControlSize, string> = { sm: "h-7", md: "h-8" }
const width = (className?: string) => (className && /(^|\s)w-/.test(className) ? "" : "w-full")
const addon = "flex h-full shrink-0 items-center gap-1 text-muted select-none [&_svg]:size-4"

/**
 * An input with things attached: an icon, a unit, a button, a shortcut hint. Unlike <AffixInput>, the slots may be
 * interactive (a ghost `xs` button fits the height). The whole frame shows focus, so it reads as one control.
 */
export function InputGroup({
  start,
  end,
  size = "md",
  className,
  inputRef,
  ...props
}: Omit<InputProps, "prefix"> & { start?: React.ReactNode; end?: React.ReactNode; inputRef?: React.Ref<HTMLInputElement> }) {
  return (
    <div className={cx(frame, width(className), heights[size], "gap-1.5 px-2.5", start ? "pl-2" : undefined, end ? "pr-1" : undefined, className)} data-slot="input-group">
      {start && <span className={addon}>{start}</span>}
      <BaseInput ref={inputRef} className="h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-faint disabled:cursor-not-allowed" {...props} />
      {end && <span className={cx(addon, "pr-1.5 has-[button]:pr-0")}>{end}</span>}
    </div>
  )
}

/**
 * A search box: icon, a clear button once there's text, and an optional page-wide shortcut that focuses it
 * (`hotkey="/"` or `"mod+k"`, shown as a hint while empty). Escape clears it.
 */
export function SearchInput({
  value,
  onValueChange,
  hotkey,
  clearLabel = "Clear search",
  size = "md",
  className,
  ...props
}: Omit<InputProps, "value" | "onValueChange" | "prefix" | "type"> & { value: string; onValueChange: (value: string) => void; hotkey?: string; clearLabel?: string }) {
  const ref = React.useRef<HTMLInputElement>(null)
  useHotkey(hotkey ?? "", () => ref.current?.focus(), { enabled: !!hotkey })
  return (
    <InputGroup
      inputRef={ref}
      type="search"
      size={size}
      className={cx("[&_input::-webkit-search-cancel-button]:appearance-none", className)}
      value={value}
      onValueChange={(v) => onValueChange(v)}
      onKeyDown={(e) => {
        if (e.key === "Escape" && value) {
          e.preventDefault()
          onValueChange("")
        }
      }}
      start={<Search />}
      end={
        value ? (
          <button type="button" className={buttonClass({ variant: "ghost", size: "xs", icon: true })} aria-label={clearLabel} onClick={() => (onValueChange(""), ref.current?.focus())}>
            <X />
          </button>
        ) : hotkey ? (
          <Kbd hotkey={hotkey} aria-hidden />
        ) : undefined
      }
      {...props}
    />
  )
}

/** A password field with a show / hide button. */
export function PasswordInput({ showLabel = "Show password", hideLabel = "Hide password", size = "md", ...props }: Omit<InputProps, "type" | "prefix"> & { showLabel?: string; hideLabel?: string }) {
  const [visible, setVisible] = React.useState(false)
  return (
    <InputGroup
      type={visible ? "text" : "password"}
      autoComplete="current-password"
      size={size}
      end={
        <button
          type="button"
          className={buttonClass({ variant: "ghost", size: "xs", icon: true })}
          aria-label={visible ? hideLabel : showLabel}
          aria-pressed={visible}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? <EyeOff /> : <Eye />}
        </button>
      }
      {...props}
    />
  )
}

const stepper =
  "flex h-full w-7 shrink-0 items-center justify-center text-muted outline-none transition-colors hover:bg-hover hover:text-fg focus-visible:bg-hover data-[disabled]:pointer-events-none data-[disabled]:opacity-40 [&_svg]:size-3.5"

/**
 * A number with − / + steppers. Arrow keys step by `step`, Shift+arrows by `largeStep`; `format` takes Intl options
 * (currency, percent, units) and the value stays a number. Put it in a <Field> for the label.
 */
export function NumberInput({
  value,
  defaultValue,
  onValueChange,
  min,
  max,
  step = 1,
  largeStep = 10,
  format,
  size = "md",
  className,
  disabled,
  name,
  id,
  "aria-label": ariaLabel,
  decrementLabel = "Decrease",
  incrementLabel = "Increase",
}: {
  value?: number | null
  defaultValue?: number
  onValueChange?: (value: number | null) => void
  min?: number
  max?: number
  step?: number
  largeStep?: number
  format?: Intl.NumberFormatOptions
  size?: ControlSize
  className?: string
  disabled?: boolean
  name?: string
  id?: string
  "aria-label"?: string
  decrementLabel?: string
  incrementLabel?: string
}) {
  return (
    <BaseNumberField.Root
      id={id}
      name={name}
      value={value}
      defaultValue={defaultValue}
      onValueChange={(v) => onValueChange?.(v)}
      min={min}
      max={max}
      step={step}
      largeStep={largeStep}
      format={format}
      disabled={disabled}
      className={cx(width(className), className)}
    >
      <BaseNumberField.Group className={cx(frame, heights[size], "overflow-hidden")}>
        <BaseNumberField.Decrement className={cx(stepper, "border-r border-divider")} aria-label={decrementLabel}>
          <Minus />
        </BaseNumberField.Decrement>
        <BaseNumberField.Input aria-label={ariaLabel} className="h-full min-w-0 flex-1 bg-transparent px-2 text-center outline-none num" />
        <BaseNumberField.Increment className={cx(stepper, "border-l border-divider")} aria-label={incrementLabel}>
          <Plus />
        </BaseNumberField.Increment>
      </BaseNumberField.Group>
    </BaseNumberField.Root>
  )
}

/**
 * A one-time code, one box per character. Paste fills every box; `onComplete` fires once the last one is filled, so a
 * verification form can submit by itself. `groups={[3, 3]}` adds a separator between groups.
 */
export function OtpInput({
  length = 6,
  value,
  onValueChange,
  onComplete,
  groups,
  mask,
  disabled,
  id,
  name,
  "aria-label": ariaLabel,
  className,
}: {
  length?: number
  value?: string
  onValueChange?: (value: string) => void
  onComplete?: (value: string) => void
  groups?: number[]
  mask?: boolean
  disabled?: boolean
  id?: string
  name?: string
  "aria-label"?: string
  className?: string
}) {
  const breaks = new Set<number>()
  groups?.reduce((at, size) => (breaks.add(at + size), at + size), 0)
  return (
    <BaseOTPField.Root
      id={id}
      name={name}
      length={length}
      value={value}
      onValueChange={(v) => onValueChange?.(v)}
      onValueComplete={(v) => onComplete?.(v)}
      mask={mask}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cx("flex items-center gap-1.5", className)}
    >
      {Array.from({ length }, (_, i) => (
        <React.Fragment key={i}>
          {i > 0 && breaks.has(i) && <BaseOTPField.Separator className="mx-1 h-px w-2 bg-strong" />}
          <BaseOTPField.Input
            aria-label={i === 0 ? undefined : `Character ${i + 1} of ${length}`}
            className="size-9 rounded-control border border-control bg-surface text-center text-heading font-medium text-fg shadow-control outline-none transition-colors hover:border-border-hover focus:border-focus focus:ring-2 focus:ring-focus-ring data-[disabled]:opacity-50 num"
          />
        </React.Fragment>
      ))}
    </BaseOTPField.Root>
  )
}
