"use client"

import { Slider as BaseSlider } from "@base-ui/react/slider"

export function Slider({ label, ...props }: Omit<BaseSlider.Root.Props<number>, "children" | "className" | "orientation"> & { label: string }) {
  return (
    <BaseSlider.Root {...props} className="flex w-full flex-col gap-1">
      <div className="flex items-center justify-between gap-2">
        <BaseSlider.Label className="font-medium">{label}</BaseSlider.Label>
        <BaseSlider.Value className="text-label text-muted num" />
      </div>
      <BaseSlider.Control className="flex h-8 w-full touch-none items-center">
        <BaseSlider.Track className="h-1.5 w-full rounded-full bg-hover">
          <BaseSlider.Indicator className="rounded-full bg-accent" />
          <BaseSlider.Thumb className="size-4 rounded-full border border-border-hover bg-surface shadow-sm focus-visible:ring-2 focus-visible:ring-focus data-[disabled]:opacity-50" />
        </BaseSlider.Track>
      </BaseSlider.Control>
    </BaseSlider.Root>
  )
}
