import type { ComponentProps } from "react"
import { cx } from "./cx"

export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={cx("min-w-0 rounded-card border bg-surface", className)} {...props} />
}

export function CardHeader({ className, ...props }: ComponentProps<"div">) {
  return <div className={cx("flex flex-col gap-1 px-4 pt-4 pb-2", className)} {...props} />
}

export function CardTitle({ className, ...props }: ComponentProps<"h3">) {
  return <h3 className={cx("text-heading font-semibold", className)} {...props} />
}

export function CardDescription({ className, ...props }: ComponentProps<"p">) {
  return <p className={cx("text-body text-muted", className)} {...props} />
}

export function CardContent({ className, ...props }: ComponentProps<"div">) {
  return <div className={cx("px-4 py-3", className)} {...props} />
}

export function CardFooter({ className, ...props }: ComponentProps<"div">) {
  return <div className={cx("flex flex-wrap items-center gap-2 border-t border-divider px-4 py-3", className)} {...props} />
}
