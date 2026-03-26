/**
 * Global Currency Configuration
 * Centralized place to manage currency formatting across the application
 */

export const DEFAULT_CURRENCY_CONFIG = {
  // Default locale (can be overridden by shop profile)
  locale: "it-IT",
  
  // Default currency code (can be overridden by shop profile)
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
