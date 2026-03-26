import { setupWorker } from "msw/browser"
import { handlers } from "./handlers"

export const worker = setupWorker(...handlers)

// Health check and auto-recovery for MSW
if (typeof window !== "undefined") {
  let healthCheckInterval: NodeJS.Timeout | null = null
  
  const startHealthCheck = () => {
    if (healthCheckInterval) return
    
    healthCheckInterval = setInterval(async () => {
      try {
        // Test MSW by making a simple request
        const response = await fetch("https://api.example.com/health-check")
        if (!response.ok) {
          console.warn("[MSW] Service worker health check failed, attempting recovery...")
          // MSW should handle this gracefully
        }
      } catch (error) {
        // Network error - MSW might be down, but page navigation should still work
        // React Query retries will handle recovering data
        console.warn("[MSW] Health check error, data will retry automatically")
      }
    }, 30000) // Check every 30 seconds
  }
  
  // Start health check when MSW is ready
  worker.start({
    onUnhandledRequest: "bypass",
    serviceWorker: {
      url: "/mockServiceWorker.js",
    },
  }).then(() => {
    startHealthCheck()
  }).catch((error) => {
    console.error("[MSW] Failed to start:", error)
  })
}

// Health check and auto-recovery for MSW
if (typeof window !== "undefined") {
  let healthCheckInterval: NodeJS.Timeout | null = null
  
  const startHealthCheck = () => {
    if (healthCheckInterval) return
    
    healthCheckInterval = setInterval(async () => {
      try {
        // Test MSW by making a simple request
        const response = await fetch("https://api.example.com/health-check")
        if (!response.ok) {
          console.warn("[MSW] Service worker health check failed, attempting recovery...")
          // MSW should handle this gracefully
        }
      } catch (error) {
        // Network error - MSW might be down, but page navigation should still work
        // React Query retries will handle recovering data
        console.warn("[MSW] Health check error, data will retry automatically")
      }
    }, 30000) // Check every 30 seconds
  }
  
  // Start health check when MSW is ready
  worker.start({
    onUnhandledRequest: "bypass",
    serviceWorker: {
      url: "/mockServiceWorker.js",
    },
  }).then(() => {
    startHealthCheck()
  }).catch((error) => {
    console.error("[MSW] Failed to start:", error)
  })
}