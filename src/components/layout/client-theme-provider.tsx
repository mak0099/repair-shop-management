"use client"

import { useEffect } from "react"
import { CLIENT_THEMES } from "@/constants/themes"

interface ClientThemeProviderProps {
  clientKey: keyof typeof CLIENT_THEMES
  children: React.ReactNode
}

export function ClientThemeProvider({ clientKey, children }: ClientThemeProviderProps) {
  useEffect(() => {
    const theme = CLIENT_THEMES[clientKey]
    if (!theme || !theme.colors) return

    const root = document.documentElement

    /**
     * Iterates through the colors object and sets CSS variables on the root element.
     * Example: primaryLight -> --primary-light
     */
    Object.entries(theme.colors).forEach(([key, value]) => {
      const cssVarName = `--${key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`
      root.style.setProperty(cssVarName, value)
    })
  }, [clientKey])

  return <>{children}</>
}