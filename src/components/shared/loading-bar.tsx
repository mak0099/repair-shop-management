"use client"

import { useLoading } from "./loading-context"
import { cn } from "@/lib/utils"

export function LoadingBar() {
  const { isLoading } = useLoading()

  return (
    <div
      className={cn(
        "fixed top-0 left-0 w-full h-1 z-[9999] transition-opacity duration-300",
        isLoading ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      role="progressbar"
      aria-busy={isLoading}
    >
      <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse" />
    </div>
  )
}
