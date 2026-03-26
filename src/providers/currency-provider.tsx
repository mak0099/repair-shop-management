"use client"

import React, { createContext, useContext } from "react"
import { Euro, DollarSign, Building } from "lucide-react"
import { useShopProfile } from "@/features/shop-profile/shop-profile.api"
import { DEFAULT_CURRENCY_CONFIG, type CurrencyConfig } from "@/lib/currency-config"
import { getCurrencySymbol } from "@/lib/currency-symbols"

// Currency code to lucide-react icon mapping
const CURRENCY_ICONS: Record<string, React.ComponentType<{ className: string }>> = {
  "EUR": Euro,
  "USD": DollarSign,
  "BDT": Building, // Bangladeshi Taka - using building as placeholder
  // Add more currencies as needed
}

/**
 * Get icon component for a currency code
 * Falls back to DollarSign if currency is not mapped
 */
function getCurrencyIcon(currencyCode: string): React.ComponentType<{ className: string }> {
  return CURRENCY_ICONS[currencyCode] || DollarSign
}

/**
 * Get rendered icon JSX for a currency code
 */
function getCurrencyIconJSX(currencyCode: string, className = "h-4 w-4"): React.ReactNode {
  const IconComponent = getCurrencyIcon(currencyCode)
  return React.createElement(IconComponent, { className })
}

interface CurrencyContextType {
  config: CurrencyConfig
  locale: string
  currencyCode: string
  symbol: string
  getCurrencyIcon: (className?: string) => React.ReactNode
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const { data: shopProfile } = useShopProfile()

  // Merge shop profile settings with defaults
  const currencyCode = shopProfile?.currency || DEFAULT_CURRENCY_CONFIG.currencyCode
  const config: CurrencyConfig = {
    locale: DEFAULT_CURRENCY_CONFIG.locale,
    currencyCode,
    minimumFractionDigits: DEFAULT_CURRENCY_CONFIG.minimumFractionDigits,
    maximumFractionDigits: DEFAULT_CURRENCY_CONFIG.maximumFractionDigits,
  }

  // Create a function that returns the icon JSX with custom className
  const getCurrencyIconFunc = (className = "h-4 w-4") => getCurrencyIconJSX(currencyCode, className)

  return (
    <CurrencyContext.Provider value={{ config, locale: config.locale, currencyCode, symbol: getCurrencySymbol(currencyCode), getCurrencyIcon: getCurrencyIconFunc }}>
      {children}
    </CurrencyContext.Provider>
  )
}

/**
 * Hook to access global currency configuration and icon
 * @returns Currency context with locale, currency code, config, and currencyIcon
 * @throws Error if used outside of CurrencyProvider
 */
export function useCurrency(): CurrencyContextType {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error("useCurrency must be used within CurrencyProvider")
  }
  return context
}

/**
 * Lightweight hook to get just the currency symbol
 * @returns Currency symbol string (e.g., "€", "$", "₹")
 * @throws Error if used outside of CurrencyProvider
 */
export function useCurrencySymbol(): string {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error("useCurrencySymbol must be used within CurrencyProvider")
  }
  return context.symbol
}
