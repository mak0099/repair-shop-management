"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => 
    new QueryClient({
      defaultOptions: {
        queries: {
          // Auto-retry failed requests with exponential backoff
          retry: 3,
          retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          // Keep data while refetching in background (improves UX)
          staleTime: 30000, // 30 seconds
          gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
        },
        mutations: {
          retry: 1,
          retryDelay: 1000,
        },
      },
    })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
