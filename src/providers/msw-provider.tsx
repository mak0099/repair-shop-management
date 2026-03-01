"use client"

import { useEffect, useState } from "react"
import { config } from "@/lib/config"

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [mswReady, setMswReady] = useState(!config.useMock)

  useEffect(() => {
    if (config.useMock) {
      const init = async () => {
        const { worker } = await import("@/mocks/browser")
        await worker.start({
          onUnhandledRequest: "bypass",
        })
        setMswReady(true)
      }
      init()
    }
  }, [])

  if (!mswReady) return null

  return <>{children}</>
}