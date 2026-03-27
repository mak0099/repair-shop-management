/**
 * Global Currency Configuration
 * Centralized place to manage currency formatting across the application
 * 
 * Currency Priority Chain:
 * 1. Shop Profile (Database) - per-shop setting
 * 2. NEXT_PUBLIC_DEFAULT_CURRENCY (.env) - environment fallback
 * 3. DEFAULT_CURRENCY_CONFIG - hardcoded default (EUR)
 */

export const DEFAULT_CURRENCY_CONFIG = {
  // Default locale (can be overridden by shop profile or .env)
  locale: "it-IT",
  
  // Default currency code (can be overridden by shop profile or NEXT_PUBLIC_DEFAULT_CURRENCY env)
  currencyCode: "EUR",
  
  // Default amount formatting options
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
}

export type CurrencyConfig = typeof DEFAULT_CURRENCY_CONFIG

/**
 * Format amount as currency
 * @param amount - Number or string to format
 * @param config - Currency and locale configuration
 * @returns Formatted currency string with symbol
 * @example
 * formatCurrency(100, { locale: 'en-US', currencyCode: 'USD' })
 * // Returns: "$100.00" or "100$ USD" based on locale
 */
export function formatCurrency(
  amount: number | string | undefined | null,
  config: Partial<CurrencyConfig> = {}
): string {
  const finalConfig = { ...DEFAULT_CURRENCY_CONFIG, ...config }
  
  const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount

  if (numericAmount === undefined || numericAmount === null || isNaN(numericAmount)) {
    return "-"
  }

  return new Intl.NumberFormat(finalConfig.locale, {
    style: "currency",
    currency: finalConfig.currencyCode,
    minimumFractionDigits: finalConfig.minimumFractionDigits,
    maximumFractionDigits: finalConfig.maximumFractionDigits,
  }).format(numericAmount)
}
