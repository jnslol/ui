"use client"

import { Accordion as BaseAccordion } from "@base-ui/react/accordion"
import { ChevronDown } from "lucide-react"
import type { ReactNode } from "react"

type AccordionItem = { value: string; title: ReactNode; content: ReactNode; disabled?: boolean }

export function Accordion({ items, defaultValue, multiple }: {
  items: AccordionItem[]
  defaultValue?: string[]
  multiple?: boolean
}) {
  return (
    <BaseAccordion.Root defaultValue={defaultValue} multiple={multiple} className="divide-y divide-divider rounded-card border bg-surface">
      {items.map(({ value, title, content, disabled }) => (
        <BaseAccordion.Item key={value} value={value} disabled={disabled}>
          <BaseAccordion.Header>
            <BaseAccordion.Trigger className="group flex min-h-10 w-full items-center justify-between gap-3 px-3 py-2 text-left font-medium hover:bg-hover focus-visible:outline-offset-[-2px] disabled:opacity-50">
              {title}
              <ChevronDown aria-hidden className="size-4 shrink-0 text-muted transition-transform group-aria-expanded:rotate-180 motion-reduce:transition-none" />
            </BaseAccordion.Trigger>
          </BaseAccordion.Header>
          <BaseAccordion.Panel className="px-3 pt-1 pb-3 text-muted">{content}</BaseAccordion.Panel>
        </BaseAccordion.Item>
      ))}
    </BaseAccordion.Root>
  )
}
