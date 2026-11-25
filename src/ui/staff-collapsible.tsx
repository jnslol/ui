"use client"

import { Collapsible as BaseCollapsible } from "@base-ui/react/collapsible"
import { ChevronRight } from "lucide-react"
import type { ReactNode } from "react"

export function Collapsible({ label, children, defaultOpen = false }: { label: ReactNode; children: ReactNode; defaultOpen?: boolean }) {
  return (
    <BaseCollapsible.Root defaultOpen={defaultOpen} className="rounded-card border bg-surface">
      <BaseCollapsible.Trigger className="group flex h-8 w-full items-center gap-2 px-3 text-left font-medium hover:bg-hover focus-visible:outline-offset-[-2px]">
        <ChevronRight aria-hidden className="size-4 shrink-0 text-muted transition-transform group-aria-expanded:rotate-90 motion-reduce:transition-none" />
        {label}
      </BaseCollapsible.Trigger>
      <BaseCollapsible.Panel className="border-t border-divider p-3 text-muted">{children}</BaseCollapsible.Panel>
    </BaseCollapsible.Root>
  )
}
