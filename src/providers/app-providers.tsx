"use client"

import React from "react"
import { modalRegistry } from "@/config/modal-config"
import { GlobalModalProvider } from "@/components/shared/global-modal-context"
import QueryProvider from "./query-provider"

// Add all new global providers to this array.
// The order matters if one provider depends on another.
const modalProviders = modalRegistry.map((config) => config.providerComponent)

const providers = [
  QueryProvider,
  GlobalModalProvider,
  ...modalProviders,
]

export function AppProviders({ children }: { children: React.ReactNode }) {
  return providers.reduceRight((acc, Provider) => {
    return <Provider>{acc}</Provider>
  }, <>{children}</>)
}