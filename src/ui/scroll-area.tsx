"use client"

import * as React from "react"
import { ScrollArea as BaseScrollArea } from "@base-ui/react/scroll-area"

import { cx } from "./cx"

const bar =
  "flex touch-none p-0.5 opacity-0 transition-opacity duration-150 select-none data-[hovering]:opacity-100 data-[scrolling]:opacity-100 data-[scrolling]:duration-0 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:h-2.5 data-[orientation=horizontal]:flex-col"

// Fades the content out under the edge it can still scroll towards, so a cut-off list doesn't look finished.
const fades = {
  y: "mask-linear-[to_bottom,transparent_0,black_min(24px,var(--scroll-area-overflow-y-start)),black_calc(100%_-_min(24px,var(--scroll-area-overflow-y-end,24px))),transparent_100%]",
  x: "mask-linear-[to_right,transparent_0,black_min(24px,var(--scroll-area-overflow-x-start)),black_calc(100%_-_min(24px,var(--scroll-area-overflow-x-end,24px))),transparent_100%]",
}

/**
 * A scrolling region with thin overlay scrollbars that show while hovering or scrolling. Give it a height (`h-64`,
 * `max-h-80`). `fade` masks the edge that has more content. The viewport takes keyboard focus so it can scroll by keys.
 */
export function ScrollArea({
  orientation = "vertical",
  fade = false,
  className,
  viewportClassName,
  children,
  "aria-label": ariaLabel,
}: {
  orientation?: "vertical" | "horizontal" | "both"
  fade?: boolean
  className?: string
  viewportClassName?: string
  children: React.ReactNode
  "aria-label"?: string
}) {
  const y = orientation !== "horizontal"
  const x = orientation !== "vertical"
  return (
    <BaseScrollArea.Root className={cx("relative flex min-h-0 overflow-hidden", className)}>
      <BaseScrollArea.Viewport
        aria-label={ariaLabel}
        className={cx(
          "min-h-0 w-full flex-1 overscroll-contain rounded-[inherit] outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus",
          fade && y && fades.y,
          fade && x && !y && fades.x,
          viewportClassName,
        )}
      >
        <BaseScrollArea.Content className={x ? "min-w-fit" : undefined}>{children}</BaseScrollArea.Content>
      </BaseScrollArea.Viewport>
      {y && (
        <BaseScrollArea.Scrollbar orientation="vertical" className={bar}>
          <BaseScrollArea.Thumb className="w-full rounded-full bg-strong hover:bg-border-hover" />
        </BaseScrollArea.Scrollbar>
      )}
      {x && (
        <BaseScrollArea.Scrollbar orientation="horizontal" className={bar}>
          <BaseScrollArea.Thumb className="h-full rounded-full bg-strong hover:bg-border-hover" />
        </BaseScrollArea.Scrollbar>
      )}
      {x && y && <BaseScrollArea.Corner />}
    </BaseScrollArea.Root>
  )
}
