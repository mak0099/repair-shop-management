/**
 * Custom hook for currency formatting
 * Automatically handles currency symbol, locale, and decimals based on shop profile
 * 
 * @usage In components:
 * const currency = useCurrencyFormatter()
 * return <p>Price: {currency(100)}</p>
 * 
 * Symbol placement and all formatting is handled globally
 */

"use client"

import { useCurrency } from "@/providers/currency-provider"
import { formatCurrency } from "@/lib/currency-config"

export function useCurrencyFormatter() {
  const { config } = useCurrency()

  /**
   * Format any amount as currency
   * @param amount - Number to format
   * @returns Formatted string with symbol, locale, and decimals
   * @example
   * currency(100) // "€100.00" or "$100.00" or "৳100" based on config
   */
  const currency = (amount: number | string | undefined | null): string => {
    return formatCurrency(amount, config)
  }

  return currency
}
