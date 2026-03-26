/**
 * Currency Code to Symbol Mapping
 * Centralized place for currency symbols
 */

export const CURRENCY_SYMBOLS: Record<string, string> = {
  "EUR": "€",
  "USD": "$",
  "BDT": "৳",
}

/**
 * Get currency symbol for a given currency code
 * Falls back to the currency code itself if symbol not found
 */
export function getCurrencySymbol(currencyCode: string): string {
  return CURRENCY_SYMBOLS[currencyCode] || currencyCode
}
