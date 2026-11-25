"use client"

import { Avatar as BaseAvatar } from "@base-ui/react/avatar"
import { UserRound } from "lucide-react"
import { cx } from "./cx"

const sizes = { sm: "size-6 text-micro", md: "size-8 text-label", lg: "size-10 text-body" }

export function Avatar({ name, src, size = "sm", decorative = true, className }: {
  name: string
  src?: string
  size?: keyof typeof sizes
  decorative?: boolean
  className?: string
}) {
  const initials = name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => Array.from(part)[0]?.toUpperCase()).join("")
  return (
    <BaseAvatar.Root
      aria-hidden={decorative || undefined}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : name}
      className={cx("relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent-subtle font-semibold text-accent-fg", sizes[size], className)}
    >
      {src && <BaseAvatar.Image src={src} alt="" className="size-full object-cover" />}
      <BaseAvatar.Fallback className="grid size-full place-items-center">{initials || <UserRound className="size-1/2" aria-hidden />}</BaseAvatar.Fallback>
    </BaseAvatar.Root>
  )
}
