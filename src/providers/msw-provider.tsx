"use client"

import { useState, useEffect, type PropsWithChildren } from "react"
import { useLoading } from "@/components/shared/loading-context"

const IS_BROWSER = typeof window !== "undefined"

// We only want to mock in development environments.
const shouldMock = process.env.NEXT_PUBLIC_API_MOCKING === "enabled"

export function MSWProvider({ children }: PropsWithChildren) {
  const [isMockingReady, setIsMockingReady] = useState(!shouldMock)
  const { startLoading, stopLoading } = useLoading()

  useEffect(() => {
    async function enableApiMocking() {
      if (IS_BROWSER && shouldMock) {
        startLoading()
        const { worker } = await import("@/mocks/browser")
        // Start the worker and wait for it to be ready.
        await worker.start({ onUnhandledRequest: "bypass" })
        setIsMockingReady(true)
        stopLoading()
      }
    }
    // Only run this if mocking is not already ready
    if (!isMockingReady) {
      enableApiMocking()
    }
  }, [isMockingReady, startLoading, stopLoading])

  // If mocking is enabled but not ready yet, don't render children.
  if (!isMockingReady) {
    return null // The LoadingBar in the layout will be visible
  }

  return <>{children}</>
}