"use client"

import { useState, useEffect, type PropsWithChildren, useRef } from "react"
import { useLoading } from "@/components/shared/loading-context"

const IS_BROWSER = typeof window !== "undefined"
const shouldMock = process.env.NEXT_PUBLIC_API_MOCKING === "enabled"

export function MSWProvider({ children }: PropsWithChildren) {
  const [isMockingReady, setIsMockingReady] = useState(!shouldMock)
  const { startLoading, stopLoading } = useLoading()
  const workStartedRef = useRef(false)

  useEffect(() => {
    if (!isMockingReady) {
      const initMocking = async () => {
        if (workStartedRef.current || !IS_BROWSER || !shouldMock) return

        workStartedRef.current = true
        startLoading()

        try {
          const { worker } = await import("@/mocks/browser")
          await worker.start({
            onUnhandledRequest: "bypass",
            serviceWorker: {
              url: "/mockServiceWorker.js",
            },
          })
          setIsMockingReady(true)
        } catch (error) {
          console.error("[MSW] Failed to start:", error)
          setIsMockingReady(true)
        } finally {
          stopLoading()
        }
      }

      initMocking()
    }
  }, [isMockingReady, startLoading, stopLoading])

  if (!isMockingReady) {
    return null
  }

  return <>{children}</>
}
