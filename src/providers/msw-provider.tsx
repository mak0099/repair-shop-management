"use client"

import { useEffect, useState } from "react"

const IS_MOCKING_ENABLED = process.env.NEXT_PUBLIC_USE_MOCK === "true"

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(!IS_MOCKING_ENABLED)

  useEffect(() => {
    // Debugging: Check if env vars are loaded
    if (process.env.NODE_ENV === "development") {
      console.log("[MSW] Mocking Enabled:", IS_MOCKING_ENABLED)
    }

    if (!IS_MOCKING_ENABLED) return

    const init = async () => {
      try {
        const { worker } = await import("@/mocks/browser")
        await worker.start({
          onUnhandledRequest: "bypass",
        })
        console.log("[MSW] Mock Service Worker started successfully")
        setIsReady(true)
      } catch (error) {
        console.error("[MSW] Failed to start Mock Service Worker:", error)
        setIsReady(true)
      }
    }

    init()
  }, [])

  if (!isReady) {
    return null // অথবা এখানে একটি লোডিং স্পিনার দেখাতে পারেন
  }

  return <>{children}</>
}