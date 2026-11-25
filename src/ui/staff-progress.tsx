"use client"

import { Progress as BaseProgress } from "@base-ui/react/progress"

export function Progress({ value, label }: { value: number | null; label: string }) {
  return (
    <BaseProgress.Root value={value} className="flex w-full flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <BaseProgress.Label className="font-medium">{label}</BaseProgress.Label>
        <BaseProgress.Value className="text-label text-muted num">{(formatted) => value === null ? "In progress" : formatted}</BaseProgress.Value>
      </div>
      <BaseProgress.Track className="h-1.5 overflow-hidden rounded-full bg-hover">
        <BaseProgress.Indicator className="h-full rounded-full bg-accent transition-[width] data-[indeterminate]:w-1/3 motion-reduce:transition-none" />
      </BaseProgress.Track>
    </BaseProgress.Root>
  )
}
