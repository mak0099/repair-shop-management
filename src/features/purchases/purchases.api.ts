"use client"

import { createApiHooksFor } from "@/lib/api-factory"
import { createBulkDeleteHook } from "@/lib/api-bulk-hooks"
import { api } from "@/lib/api-client" // আপনার এপিআই ক্লায়েন্ট
import type { ProductPurchase, PurchaseFormValues } from "./purchases.schema"

const purchaseApiHooks = createApiHooksFor<ProductPurchase, PurchaseFormValues, Partial<PurchaseFormValues>>("purchases")

export const usePurchases = purchaseApiHooks.useGetList
export const usePurchase = purchaseApiHooks.useGetOne
export const useCreatePurchase = purchaseApiHooks.useCreate
export const useDeletePurchase = purchaseApiHooks.useDelete
export const useDeleteManyPurchases = createBulkDeleteHook("purchases")

/**
 * Purchase এর জন্য আইটেম ডিটেইলস আনার ফাংশন
 * এটি ম্যানুয়ালি কল করা হবে handleAddItem এর ভেতরে
 */
export const fetchItemDetailsForPurchase = async (productId: string) => {
  const response = await api.get<{ purchasePrice: number, name: string }>(`purchases/item-details/${productId}`);
  return response.data;
}