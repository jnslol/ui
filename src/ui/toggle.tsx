"use client"

import * as React from "react"
import { Toggle as BaseToggle } from "@base-ui/react/toggle"
import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group"

import { cx } from "./cx"

export type ToggleVariant = "ghost" | "outline"
export type ToggleSize = "xs" | "sm" | "md"

const base =
  "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-control font-medium text-muted select-none outline-none transition-colors duration-100 hover:bg-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus data-[pressed]:bg-active data-[pressed]:text-fg data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:shrink-0"
const variants: Record<ToggleVariant, string> = {
  ghost: "",
  outline: "border border-control bg-surface shadow-control data-[pressed]:border-strong",
}
const sizes: Record<ToggleSize, { text: string; icon: string }> = {
  xs: { text: "h-6 px-2 text-label [&_svg]:size-3.5", icon: "size-6 [&_svg]:size-3.5" },
  sm: { text: "h-7 px-2.5 text-body [&_svg]:size-4", icon: "size-7 [&_svg]:size-4" },
  md: { text: "h-8 px-3 text-body [&_svg]:size-4", icon: "size-8 [&_svg]:size-4" },
}

export function toggleClass({ variant = "ghost", size = "sm", icon = false, className }: { variant?: ToggleVariant; size?: ToggleSize; icon?: boolean; className?: string } = {}) {
  return cx(base, variants[variant], icon ? sizes[size].icon : sizes[size].text, className)
}

/** A button that stays pressed: bold, pin, "show only mine". `aria-pressed` tells assistive tech. Give an icon-only toggle an aria-label. */
export function Toggle({ variant, size, icon, className, ...props }: Omit<BaseToggle.Props, "className"> & { variant?: ToggleVariant; size?: ToggleSize; icon?: boolean; className?: string }) {
  return <BaseToggle className={toggleClass({ variant, size, icon, className })} {...props} />
}

export type ToggleOption<V extends string> = { value: V; label?: React.ReactNode; icon?: React.ReactNode; disabled?: boolean; "aria-label"?: string }

/**
 * A row of toggles. `multiple` lets several be pressed at once (text styles, weekday picker); without it, one at most
 * and pressing it again clears it (unlike <Segmented>, which always has a value).
 */
export function ToggleGroup<V extends string>({
  options,
  value,
  onValueChange,
  multiple = false,
  variant = "outline",
  size = "sm",
  className,
  "aria-label": ariaLabel,
}: {
  options: ToggleOption<V>[]
  value: V[]
  onValueChange: (value: V[]) => void
  multiple?: boolean
  variant?: ToggleVariant
  size?: ToggleSize
  className?: string
  "aria-label"?: string
}) {
  const joined = variant === "outline"
  return (
    <BaseToggleGroup
      value={value}
      onValueChange={(v) => onValueChange(v as V[])}
      multiple={multiple}
      aria-label={ariaLabel}
      className={cx(
        "inline-flex w-fit items-center",
        joined
          ? "rounded-control shadow-control [&>*]:shadow-none [&>*:focus-visible]:z-10 [&>*:not(:first-child)]:-ml-px [&>*:not(:first-child)]:rounded-l-none [&>*:not(:last-child)]:rounded-r-none"
          : "gap-0.5",
        className,
      )}
    >
      {options.map((o) => (
        <BaseToggle
          key={o.value}
          value={o.value}
          disabled={o.disabled}
          aria-label={o["aria-label"]}
          className={toggleClass({ variant, size, icon: !!o.icon && !o.label, className: "relative" })}
        >
          {o.icon}
          {o.label}
        </BaseToggle>
      ))}
    </BaseToggleGroup>
  )
}
