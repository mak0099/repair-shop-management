"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { useLoading } from "./loading-context"

export function NavigationEvents() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { startLoading, stopLoading } = useLoading()

  useEffect(() => {
    stopLoading()
  }, [pathname, searchParams, stopLoading])

  useEffect(() => {
    const handleLinkClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const anchor = target.closest("a")

      if (anchor && anchor.href && anchor.target !== "_blank" && anchor.href.startsWith(window.location.origin) && anchor.getAttribute('href') !== pathname) {
        startLoading()
      }
    }

    document.addEventListener("click", handleLinkClick)
    return () => document.removeEventListener("click", handleLinkClick)
  }, [startLoading, pathname])

  return null
}
