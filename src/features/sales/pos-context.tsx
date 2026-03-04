"use client"

import React, { createContext, useContext, useState, useMemo, useCallback } from "react"
import { SaleItem } from "./sales.schema"
import { DEFAULT_TAX_RATE } from "./sales.constants"

// প্রোডাক্টের জন্য নির্দিষ্ট ইন্টারফেস (Any রিমুভ করা হয়েছে)
export interface POSProduct {
  id: string
  name: string
  sku?: string
  salePrice: number
  type: "PRODUCT" | "SERVICE"
  stock?: number // ঐচ্ছিক, স্টোক চেক করার জন্য
}

interface POSContextType {
  cart: SaleItem[]
  selectedCustomerId: string | null
  setCustomerId: (id: string | null) => void
  addItem: (product: POSProduct) => void // Strictly typed
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  updatePrice: (productId: string, price: number) => void
  clearCart: () => void
  totals: {
    subtotal: number
    tax: number
    discount: number
    grandTotal: number
  }
}

const POSContext = createContext<POSContextType | undefined>(undefined)

export function POSProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<SaleItem[]>([])
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)

  // আইটেম যোগ করার সময় টাইপ চেকিং নিশ্চিত করা হয়েছে
  const addItem = useCallback((product: POSProduct) => {
    setCart((prev) => {
      const existingItem = prev.find((item) => item.productId === product.id)
      
      if (existingItem) {
        const newQty = existingItem.quantity + 1
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: newQty, subtotal: newQty * item.price }
            : item
        )
      }

      const newItem: SaleItem = {
        productId: product.id,
        name: product.name,
        sku: product.sku || "",
        price: product.salePrice,
        quantity: 1,
        discount: 0,
        tax: 0,
        subtotal: product.salePrice,
        type: product.type,
      }
      return [...prev, newItem]
    })
  }, [])

  const removeItem = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId))
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) return
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity, subtotal: quantity * item.price }
          : item
      )
    )
  }, [])

  const updatePrice = useCallback((productId: string, price: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, price, subtotal: item.quantity * price }
          : item
      )
    )
  }, [])

  const clearCart = useCallback(() => {
    setCart([])
    setSelectedCustomerId(null)
  }, [])

  const totals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0)
    const discount = cart.reduce((sum, item) => sum + (item.discount || 0), 0)
    const tax = subtotal * DEFAULT_TAX_RATE
    const grandTotal = subtotal + tax - discount

    return { subtotal, tax, discount, grandTotal }
  }, [cart])

  const value = useMemo(() => ({
    cart,
    selectedCustomerId,
    setCustomerId: setSelectedCustomerId,
    addItem,
    removeItem,
    updateQuantity,
    updatePrice,
    clearCart,
    totals,
  }), [cart, selectedCustomerId, addItem, removeItem, updateQuantity, updatePrice, clearCart, totals])

  return <POSContext.Provider value={value}>{children}</POSContext.Provider>
}

export const usePOS = () => {
  const context = useContext(POSContext)
  if (!context) throw new Error("usePOS must be used within a POSProvider")
  return context
}