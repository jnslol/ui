import { Separator as BaseSeparator } from "@base-ui/react/separator"
import { cx } from "./staff-cx"

export function Separator({ orientation = "horizontal", className, ...props }: Omit<BaseSeparator.Props, "className"> & { className?: string }) {
  return (
    <BaseSeparator orientation={orientation}
      className={cx("shrink-0 bg-divider", orientation === "horizontal" ? "h-px w-full" : "w-px self-stretch", className)}
      {...props} />
  )
}
