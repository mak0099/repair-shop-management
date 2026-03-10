"use client"

import * as React from "react"

interface LayoutContextProps {
  isTopNav: boolean
  toggleLayout: () => void
}

const LayoutContext = React.createContext<LayoutContextProps | undefined>(undefined)

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [isTopNav, setIsTopNav] = React.useState(true)

  // Load preference from localStorage on mount
  React.useEffect(() => {
    const savedMode = localStorage.getItem("layout_mode")
    if (savedMode === "side") {
      setIsTopNav(false)
    }
  }, [])

  const toggleLayout = () => {
    setIsTopNav((prev) => {
      const next = !prev
      localStorage.setItem("layout_mode", next ? "top" : "side")
      return next
    })
  }

  return (
    <LayoutContext.Provider value={{ isTopNav, toggleLayout }}>
      {children}
    </LayoutContext.Provider>
  )
}

export function useLayout() {
  const context = React.useContext(LayoutContext)
  if (!context) {
    throw new Error("useLayout must be used within a LayoutProvider")
  }
  return context
}