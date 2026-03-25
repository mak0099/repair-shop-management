"use client"

import React, { createContext, useContext } from "react"
import { useShopProfile } from "@/features/shop-profile/shop-profile.api"
import { DEFAULT_CURRENCY_CONFIG, type CurrencyConfig } from "@/lib/currency-config"

interface CurrencyContextType {
  config: CurrencyConfig
  locale: string
  currencyCode: string
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const { data: shopProfile } = useShopProfile()

  // Merge shop profile settings with defaults
  const config: CurrencyConfig = {
    locale: DEFAULT_CURRENCY_CONFIG.locale,
    currencyCode: shopProfile?.currency || DEFAULT_CURRENCY_CONFIG.currencyCode,
    minimumFractionDigits: DEFAULT_CURRENCY_CONFIG.minimumFractionDigits,
    maximumFractionDigits: DEFAULT_CURRENCY_CONFIG.maximumFractionDigits,
  }

  return (
    <CurrencyContext.Provider value={{ config, locale: config.locale, currencyCode: config.currencyCode }}>
      {children}
    </CurrencyContext.Provider>
  )
}

/**
 * Hook to access global currency configuration
 * @returns Currency context with locale and currency code
 * @throws Error if used outside of CurrencyProvider
 */
export function useCurrency(): CurrencyContextType {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error("useCurrency must be used within CurrencyProvider")
  }
  return context
}
