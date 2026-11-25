import * as React from "react"

import { cx } from "./cx"

export type ItemVariant = "plain" | "outline" | "muted"

const variants: Record<ItemVariant, string> = {
  plain: "",
  outline: "rounded-card border border-border bg-surface",
  muted: "rounded-card bg-subtle",
}

/**
 * One row of something that isn't a table: a member, an integration, a file, a setting with its action.
 * Media on the left, title and description, actions on the right. `render={<a href />}` makes the whole row a link
 * (keep the actions outside it then). Stack them in an <ItemGroup>.
 */
export function Item({
  media,
  title,
  description,
  actions,
  variant = "plain",
  size = "md",
  render,
  className,
}: {
  media?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  variant?: ItemVariant
  size?: "sm" | "md"
  /** The element the row renders as: <a href="…" /> or a router Link. */
  render?: React.ReactElement<{ className?: string; children?: React.ReactNode }>
  className?: string
}) {
  const classes = cx(
    "group/item flex min-w-0 items-center gap-3",
    size === "sm" ? "min-h-10 px-3 py-1.5" : "min-h-row px-4 py-2.5",
    variants[variant],
    render && "outline-none transition-colors hover:bg-hover focus-visible:outline-2 focus-visible:outline-focus",
    className,
  )
  const body = (
    <>
      {media && <div className="flex shrink-0 items-center text-muted [&>svg]:size-4">{media}</div>}
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-medium">{title}</span>
        {description && <span className="truncate text-label text-muted">{description}</span>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-1.5">{actions}</div>}
    </>
  )
  if (render) return React.cloneElement(render, { className: cx(classes, render.props.className), children: body })
  return (
    <div data-slot="item" className={classes}>
      {body}
    </div>
  )
}

/** Items stacked with dividers between them, in one bordered panel. */
export function ItemGroup({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div role="list" className={cx("flex flex-col divide-y divide-divider overflow-hidden rounded-card border border-border bg-surface", className)} {...props}>
      {React.Children.map(children, (child) => child && <div role="listitem">{child}</div>)}
    </div>
  )
}

/** A square media slot for an Item: an icon on a tinted tile. */
export function ItemIcon({ className, ...props }: React.ComponentProps<"span">) {
  return <span className={cx("grid size-8 place-items-center rounded-control border border-border bg-subtle text-muted [&>svg]:size-4", className)} {...props} />
}
