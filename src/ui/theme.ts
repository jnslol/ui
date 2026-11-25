"use client"

import { useEffect, useState } from "react"

export type Theme = "light" | "dark" | "system"

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "system"
    try {
      // Falls back to the key used before the rename, so a saved preference survives the upgrade.
      const stored = window.localStorage.getItem("jns-ui-theme") ?? window.localStorage.getItem("staff-theme")
      if (stored === "light" || stored === "dark") return stored
    } catch {
      // The theme still works for the current session when storage is unavailable.
    }
    return "system"
  })

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const apply = () => {
      document.documentElement.dataset.theme = theme === "system" ? (media.matches ? "dark" : "light") : theme
    }
    try {
      window.localStorage.setItem("jns-ui-theme", theme)
    } catch {
      // Keep the in-memory preference.
    }
    apply()
    media.addEventListener("change", apply)
    return () => media.removeEventListener("change", apply)
  }, [theme])

  return [theme, setTheme] as const
}
