"use client"

import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api-client"
import { createApiHooksFor } from "@/lib/api-factory"
import { createBulkDeleteHook } from "@/lib/api-bulk-hooks"
import type { Sale, SaleFormValues } from "./sales.schema"
import { POSProduct } from "./pos-context"

/**
 * Standard Sales API Hooks using Factory
 * Endpoint: "sales" for History, Details, and Deletion
 */
const salesApiHooks = createApiHooksFor<Sale, SaleFormValues, Partial<SaleFormValues>>("sales")

export const useSales = salesApiHooks.useGetList
export const useSale = salesApiHooks.useGetOne
export const useCreateSale = salesApiHooks.useCreate
export const useDeleteSale = salesApiHooks.useDelete
export const useDeleteManySales = createBulkDeleteHook("sales")

/**
 * Dedicated POS Product Hook
 * Fetching from a specialized endpoint for security and performance
 */
export const usePOSItems = (search: string = "", categoryId: string = "") => {
  return useQuery<POSProduct[]>({
    queryKey: ["pos-products", search, categoryId],
    queryFn: async () => {
      // Points to a dedicated POS endpoint instead of general items
      const response = await api.get<{ data: POSProduct[] }>("/pos/products", { 
        params: { 
          search, 
          categoryId,
          isActive: true
        } 
      })
      
      return response.data || []
    },
    // POS data should be relatively fresh
    staleTime: 1000 * 60 * 5, 
  })
}