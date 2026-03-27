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
 * POS Filter Parameters
 */
export interface POSFilterParams {
  search?: string
  categoryId?: string
  brandId?: string
  condition?: string
  deviceType?: string
  color?: string
  partType?: string
  compatibility?: string
  serviceType?: string
  itemType?: string
}

/**
 * Dedicated POS Product Hook with Multi-Filter Support
 * Fetching from a specialized endpoint for security and performance
 */
export const usePOSItems = (filters: POSFilterParams = {}) => {
  const {
    search = "",
    categoryId = "",
    brandId = "",
    condition = "",
    deviceType = "",
    partType = "",
    compatibility = "",
    serviceType = "",
    itemType = ""
  } = filters

  return useQuery<POSProduct[]>({
    queryKey: ["pos-products", search, categoryId, brandId, condition, deviceType, partType, compatibility, serviceType, itemType],
    queryFn: async () => {
      // Points to a dedicated POS endpoint instead of general items
      const params: Record<string, string> = { isActive: "true" }
      
      if (search) params.search = search
      if (categoryId) params.categoryId = categoryId
      if (brandId) params.brandId = brandId
      if (condition) params.condition = condition
      if (deviceType) params.deviceType = deviceType
      if (partType) params.partType = partType
      if (compatibility) params.compatibility = compatibility
      if (serviceType) params.serviceType = serviceType
      if (itemType) params.itemType = itemType

      const response = await api.get<{ data: POSProduct[] }>("/pos/products", { params })
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (response.data as any) || []
    },
    // POS data should be relatively fresh
    staleTime: 1000 * 60 * 5, 
  })
}