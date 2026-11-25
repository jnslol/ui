"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "./button"

export function Pagination({ page, totalPages, onPageChange, label = "Pagination" }: {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  label?: string
}) {
  if (totalPages < 2) return null
  const current = Math.max(1, Math.min(page, totalPages))
  return (
    <nav aria-label={label} className="flex w-fit items-center gap-2">
      <Button type="button" icon aria-label="Previous page" disabled={current === 1} onClick={() => onPageChange(current - 1)}>
        <ChevronLeft aria-hidden />
      </Button>
      <span aria-live="polite" className="min-w-20 text-center text-label text-muted num">Page {current} of {totalPages}</span>
      <Button type="button" icon aria-label="Next page" disabled={current === totalPages} onClick={() => onPageChange(current + 1)}>
        <ChevronRight aria-hidden />
      </Button>
    </nav>
  )
}
