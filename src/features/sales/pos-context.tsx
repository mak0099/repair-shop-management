"use client"

import React, { createContext, useContext, useState, useMemo, useCallback } from "react"
import { toast } from "sonner"
import { SaleItem } from "./sales.schema"
import { DEFAULT_TAX_RATE } from "./sales.constants"
import { Item } from "@/features/items/item.schema"
import { useShopProfile } from "@/features/shop-profile/shop-profile.api"

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
  availableQuantity?: number; // স্টকে উপলব্ধ মোট পরিমাণ
  originalItemType?: "DEVICE" | "PART" | "SERVICE" | "LOANER"; // মূল আইটেম টাইপ
}

export type POSProduct = Item;

interface POSContextType {
  cart: POSCartItem[]
  selectedCustomerId: string | null
  selectedCustomerName: string | null
  setCustomerId: (id: string | null) => void
  setCustomerField: (id: string | null, name: string | null) => void
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
  const [selectedCustomerName, setSelectedCustomerName] = useState<string | null>(null)
  const { data: shopProfile } = useShopProfile()
  const taxRate = shopProfile?.taxRate !== undefined ? shopProfile.taxRate / 100 : DEFAULT_TAX_RATE

  // Wrapper to ensure empty string becomes null for strict validation
  const setCustomerId = useCallback((id: string | null) => {
    setSelectedCustomerId(id === "" ? null : id);
  }, []);

  // Set both customer ID and name
  const setCustomerField = useCallback((id: string | null, name: string | null) => {
    setSelectedCustomerId(id === "" ? null : id);
    setSelectedCustomerName(name === "" ? null : name);
  }, []);

  /**
   * addItem Logic - Item Type ভিত্তিতে:
   * - SERVICE: শুধু type: "SERVICE", কোয়ান্টিটি increment করতে পারে
   * - PART: নন-সিরিয়ালাইজড, কোয়ান্টিটি increment (একই PART বারবার)
   * - DEVICE/LOANER: সিরিয়ালাইজড, প্রতিবার নতুন রো (IMEI tracking এর জন্য)
   */
  const addItem = useCallback((product: Item) => {
    // Stock validation - only for DEVICE/PART items, not for SERVICE (labor/services are unlimited)
    const isService = product.itemType === "SERVICE";
    const availableQuantity = (product as unknown as { quantity?: number }).quantity || 0;
    
    // Skip stock validation for SERVICE items - they don't have inventory constraints
    if (!isService && availableQuantity <= 0) {
      toast.error(`Out of Stock`, {
        description: `"${product.name}" is not available`
      });
      return;
    }

    // DEVICE/LOANER সিরিয়ালাইজড, বাকি সবাই non-serialized
    const isSerialized = product.itemType === "DEVICE" || product.itemType === "LOANER";

    setCart((prev) => {
      // PART/SERVICE এর জন্য কোয়ান্টিটি increment লজিক - একই প্রোডাক্ট হলে quantity বাড়ান
      const canIncrementQuantity = product.itemType === "PART" || product.itemType === "SERVICE";
      const existingItem = canIncrementQuantity 
        ? prev.find((item) => item.productId === product.id && item.isSerialized === false)
        : null;
      
      if (!isSerialized && existingItem) {
        // Check if adding more would exceed stock (only for DEVICE/PART, not SERVICE)
        const newQuantity = existingItem.quantity + 1;
        if (!isService && newQuantity > availableQuantity) {
          toast.warning(`Cannot add more`, {
            description: `Only ${availableQuantity} units available for "${product.name}"`
          });
          return prev;
        }
        
        return prev.map((item) =>
          item.cartId === existingItem.cartId
            ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.price }
            : item
        );
      }

      // নতুন আইটেম তৈরি বা DEVICE/LOANER এ নতুন রো (সিরিয়ালাইজড আইটেমের জন্য)
      const newItem: POSCartItem = {
        cartId: `pos-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        productId: product.id as string,
        name: (product.name || "Unknown Product") as string,
        sku: (product.sku || "") as string,
        price: product.salePrice,
        quantity: 1,
        discount: 0,
        tax: 0,
        subtotal: product.salePrice,
        // itemType অনুযায়ী SaleItem.type নির্ধারণ: SERVICE → "SERVICE", বাকি সবা → "PRODUCT"
        type: product.itemType === "SERVICE" ? "SERVICE" : "PRODUCT",
        isSerialized: isSerialized,
        // শুধুমাত্র DEVICE/LOANER এর জন্য সিরিয়াল/IMEI ডাটা প্রাসঙ্গিক
        availableSerials: isSerialized && (product as unknown as { imei?: string }).imei 
          ? (product as unknown as { imei: string }).imei.split(",").map((s: string) => s.trim()).filter(Boolean) 
          : (isSerialized && ((product as unknown as { serialList?: string[] }).serialList || []) || []),
        selectedIMEI: isSerialized ? "" : undefined,
        availableQuantity: availableQuantity, // স্টক ট্র্যাকিং
        originalItemType: product.itemType, // মূল আইটেম টাইপ ট্র্যাকিং
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
   * ৪. কোয়ান্টিটি আপডেট - শুধুমাত্র PART/SERVICE এর জন্য
   * DEVICE/LOANER (সিরিয়ালাইজড): কোয়ান্টিটি সবসময় ১, নতুন রো বা remove করে আপডেট করতে হবে
   * Stock validation: শুধুমাত্র DEVICE/PART এর জন্য, SERVICE এর জন্য নয় (SERVICE unlimited)
   */
  const updateQuantity = useCallback((cartId: string, quantity: number) => {
    if (quantity < 1) return;
    setCart((prev) =>
      prev.map((item) => {
        // নন-সিরিয়ালাইজড PART/SERVICE এ quantity update সম্ভব
        if (item.cartId === cartId && !item.isSerialized) {
          // Stock validation - check if quantity exceeds available stock (skip for SERVICE)
          const isService = item.originalItemType === "SERVICE";
          const maxQuantity = item.availableQuantity || 1;
          
          if (!isService && quantity > maxQuantity) {
            toast.warning(`Cannot add more than ${maxQuantity}`, {
              description: `Only ${maxQuantity} units available in stock for "${item.name}"`
            });
            return item;
          }
          return { ...item, quantity, subtotal: quantity * item.price };
        }
        // সিরিয়ালাইজড DEVICE/LOANER এ quantity সবসময় 1, update করা যায় না
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
    // Don't clear customer - they may want to make another purchase!
  }, []);

  /**
   * ৫. টোটাল এবং ট্যাক্স ক্যালকুলেশন
   */
  const totals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const discount = cart.reduce((sum, item) => sum + (item.discount || 0), 0);
    const tax = subtotal * taxRate;
    const grandTotal = subtotal + tax - discount;

    return { subtotal, tax, discount, grandTotal };
  }, [cart, taxRate]);

  const value = useMemo(() => ({
    cart,
    selectedCustomerId,
    selectedCustomerName,
    setCustomerId,
    setCustomerField,
    addItem,
    removeItem,
    updateQuantity,
    updateItemIMEI,
    updatePrice,
    clearCart,
    totals,
  }), [cart, selectedCustomerId, selectedCustomerName, setCustomerId, setCustomerField, addItem, removeItem, updateQuantity, updateItemIMEI, updatePrice, clearCart, totals]);

  return <POSContext.Provider value={value}>{children}</POSContext.Provider>
}

export const usePOS = () => {
  const context = useContext(POSContext);
  if (!context) throw new Error("usePOS must be used within a POSProvider");
  return context;
}