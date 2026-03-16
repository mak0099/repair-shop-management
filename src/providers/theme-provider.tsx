"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { THEME_NAMES, type ThemeName, THEMES } from "@/config/themes"

const DEFAULT_THEME_NAME = (process.env.NEXT_PUBLIC_DEFAULT_THEME as ThemeName) || "vibrantBlue";

// এখান থেকে আপনি সাইডবার এবং টপ-ন্যাভ এর ডিফল্ট ডার্ক মোড অন/অফ করতে পারবেন
const DEFAULT_ALWAYS_DARK_SIDEBAR = true; 
const DEFAULT_ALWAYS_DARK_TOPNAV = true;

interface ThemeContextType {
  themeName: ThemeName
  setThemeName: (theme: ThemeName) => void
  isDark: boolean
  alwaysDarkSidebar: boolean
  setAlwaysDarkSidebar: (val: boolean) => void
  alwaysDarkTopNav: boolean
  setAlwaysDarkTopNav: (val: boolean) => void
  availableThemes: string[]
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false)
  const [themeName, setThemeNameState] = React.useState<ThemeName>(DEFAULT_THEME_NAME)
  const [isDark, setIsDark] = React.useState(false)
  
  // --- ডাইনামিক সেটিংস স্টেট ---
  const [alwaysDarkSidebar, setAlwaysDarkSidebarState] = React.useState(DEFAULT_ALWAYS_DARK_SIDEBAR)
  const [alwaysDarkTopNav, setAlwaysDarkTopNavState] = React.useState(DEFAULT_ALWAYS_DARK_TOPNAV)

  React.useEffect(() => {
    setMounted(true)
    
    // ১. থিম নেম লোড করা
    const savedTheme = localStorage.getItem("app-theme")
    if (savedTheme && (savedTheme in THEMES)) setThemeNameState(savedTheme as ThemeName)

    // ২. নেভিগেশন সেটিংস লোড করা
    const savedSidebarDark = localStorage.getItem("always-dark-sidebar")
    if (savedSidebarDark !== null) setAlwaysDarkSidebarState(savedSidebarDark === "true")

    const savedTopNavDark = localStorage.getItem("always-dark-topnav")
    if (savedTopNavDark !== null) setAlwaysDarkTopNavState(savedTopNavDark === "true")

    // ডার্ক মোড অবজারভার
    const updateDarkMode = () => setIsDark(document.documentElement.classList.contains("dark"))
    const observer = new MutationObserver(updateDarkMode)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    updateDarkMode()
    return () => observer.disconnect()
  }, [])

  // --- সেটার ফাংশন যা localStorage এ ডাটা সেভ করবে ---
  const setThemeName = (name: ThemeName) => {
    setThemeNameState(name);
    localStorage.setItem("app-theme", name);
  }

  const setAlwaysDarkSidebar = (val: boolean) => {
    setAlwaysDarkSidebarState(val);
    localStorage.setItem("always-dark-sidebar", String(val));
  }

  const setAlwaysDarkTopNav = (val: boolean) => {
    setAlwaysDarkTopNavState(val);
    localStorage.setItem("always-dark-topnav", String(val));
  }

  // সিএসএস ভেরিয়েবল ইনজেকশন
  React.useEffect(() => {
    if (!mounted) return

    const root = document.documentElement
    const config = THEMES[themeName] || THEMES[DEFAULT_THEME_NAME]
    
    const bodyColors = isDark ? config.dark : config.light
    const sidebarColors = (isDark || alwaysDarkSidebar) ? config.dark : config.light
    const topNavColors = (isDark || alwaysDarkTopNav) ? config.dark : config.light

    // মেইন বডি লুপ
    Object.entries(bodyColors).forEach(([key, value]) => {
      if (key === 'label') return
      const cssVar = `--${key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`
      root.style.setProperty(cssVar, value as string)
    })

    // সাইডবার লুপ (--sb-)
    Object.entries(sidebarColors).forEach(([key, value]) => {
      if (key === 'label') return
      const cssVar = `--sb-${key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`
      root.style.setProperty(cssVar, value as string)
    })

    // টপ-ন্যাভ লুপ (--tn-)
    Object.entries(topNavColors).forEach(([key, value]) => {
      if (key === 'label') return
      const cssVar = `--tn-${key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`
      root.style.setProperty(cssVar, value as string)
    })

  }, [themeName, isDark, alwaysDarkSidebar, alwaysDarkTopNav, mounted])

  return (
    <ThemeContext.Provider value={{ 
      themeName, setThemeName, isDark, 
      alwaysDarkSidebar, setAlwaysDarkSidebar,
      alwaysDarkTopNav, setAlwaysDarkTopNav,
      availableThemes: THEME_NAMES as unknown as string[]
    }}>
      <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        {children}
      </NextThemesProvider>
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = React.useContext(ThemeContext)
  if (!context) throw new Error("useTheme must be used within a ThemeProvider")
  return context
}