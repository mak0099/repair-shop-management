"use client"

import React, { createContext, useContext, useState, useMemo, useCallback } from "react"
import { SaleItem } from "./sales.schema"
import { DEFAULT_TAX_RATE } from "./sales.constants"
import { Item } from "@/features/items/item.schema"

/**
 * ১. POS কার্ট আইটেম ইন্টারফেস
 * এখানে 'cartId' হলো ইউনিক আইডি যা একই মডেলের ২টো ফোনের জন্য আলাদা হবে।
 */
export interface POSCartItem extends Omit<SaleItem, "productId"> {
  cartId: string;           // UI এবং লজিকের জন্য ইউনিক আইডি
  productId: string;        // ডাটাবেজ রেফারেন্স
  isSerialized: boolean;    // ফোন বা সিরিয়াল যুক্ত আইটেম কি না
  availableSerials?: string[]; // ড্রপডাউনের জন্য স্টকে থাকা সিরিয়াল লিস্ট
  selectedIMEI?: string;    // ইউজার যেটি সিলেক্ট করেছে
}

interface POSContextType {
  cart: POSCartItem[]
  selectedCustomerId: string | null
  setCustomerId: (id: string | null) => void
  addItem: (product: Item) => void
  removeItem: (cartId: string) => void
  updateQuantity: (cartId: string, quantity: number) => void
  updateItemIMEI: (cartId: string, imei: string) => void
  updatePrice: (cartId: string, price: number) => void
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
  const [cart, setCart] = useState<POSCartItem[]>([])
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)

  // Wrapper to ensure empty string becomes null for strict validation
  const setCustomerId = useCallback((id: string | null) => {
    setSelectedCustomerId(id === "" ? null : id);
  }, []);

  /**
   * addItem Logic:
   * - Serialized (IMEI): প্রতিবার নতুন রো (Row) তৈরি হবে।
   * - Non-Serialized: একই প্রোডাক্ট হলে কোয়ান্টিটি বাড়বে।
   */
  const addItem = useCallback((product: Item) => {
    // ডাটাবেজ থেকে আসা স্ট্রিং বা বুলিয়ানকে নরমালাইজ করা
    const isSerialized = String(product.isSerialized) === "true";

    setCart((prev) => {
      // সাধারণ আইটেমের জন্য চেক: আগে থেকে কার্টে আছে কি না
      const existingItem = prev.find((item) => item.productId === product.id && !item.isSerialized);
      
      if (!isSerialized && existingItem) {
        return prev.map((item) =>
          item.cartId === existingItem.cartId
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
            : item
        );
      }

      // নতুন আইটেম অথবা সিরিয়ালাইজড আইটেম যোগ করা (নতুন ইউনিক cartId সহ)
      const newItem: POSCartItem = {
        cartId: `pos-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        productId: product.id,
        name: product.name,
        sku: product.sku || "",
        price: product.salePrice,
        quantity: 1,
        discount: 0,
        tax: 0,
        subtotal: product.salePrice,
        type: "PRODUCT", // Fixed: Schema expects "PRODUCT" or "SERVICE", not categoryId
        isSerialized: isSerialized,
        // সিরিয়াল নম্বরগুলোকে অ্যারেতে কনভার্ট করা
        availableSerials: product.imei 
          ? product.imei.split(",").map(s => s.trim()).filter(Boolean) 
          : ((product as any).serialList || []),
        selectedIMEI: "",
      };
      
      return [...prev, newItem];
    });
  }, []);

  /**
   * ৩. সিরিয়ালাইজড আইটেমের IMEI আপডেট করা
   */
  const updateItemIMEI = useCallback((cartId: string, imei: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.cartId === cartId ? { ...item, selectedIMEI: imei } : item
      )
    );
  }, []);

  const removeItem = useCallback((cartId: string) => {
    setCart((prev) => prev.filter((item) => item.cartId !== cartId));
  }, []);

  /**
   * ৪. কোয়ান্টিটি আপডেট (শুধুমাত্র নন-সিরিয়ালাইজড আইটেমের জন্য)
   */
  const updateQuantity = useCallback((cartId: string, quantity: number) => {
    if (quantity < 1) return;
    setCart((prev) =>
      prev.map((item) => {
        // সিরিয়ালাইজড আইটেমের কোয়ান্টিটি সবসময় ১ থাকবে, তাই এটি স্কিপ করবে
        if (item.cartId === cartId && !item.isSerialized) {
          return { ...item, quantity, subtotal: quantity * item.price };
        }
        return item;
      })
    );
  }, []);

  /**
   * ৬. প্রাইস আপডেট (ম্যানুয়াল ওভাররাইড)
   */
  const updatePrice = useCallback((cartId: string, price: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.cartId === cartId ? { ...item, price, subtotal: item.quantity * price } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setSelectedCustomerId(null);
  }, []);

  /**
   * ৫. টোটাল এবং ট্যাক্স ক্যালকুলেশন
   */
  const totals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const discount = cart.reduce((sum, item) => sum + (item.discount || 0), 0);
    const tax = subtotal * DEFAULT_TAX_RATE;
    const grandTotal = subtotal + tax - discount;

    return { subtotal, tax, discount, grandTotal };
  }, [cart]);

  const value = useMemo(() => ({
    cart,
    selectedCustomerId,
    setCustomerId,
    addItem,
    removeItem,
    updateQuantity,
    updateItemIMEI,
    updatePrice,
    clearCart,
    totals,
  }), [cart, selectedCustomerId, addItem, removeItem, updateQuantity, updateItemIMEI, updatePrice, clearCart, totals]);

  return <POSContext.Provider value={value}>{children}</POSContext.Provider>
}

export const usePOS = () => {
  const context = useContext(POSContext);
  if (!context) throw new Error("usePOS must be used within a POSProvider");
  return context;
}