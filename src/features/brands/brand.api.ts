import { useQuery } from "@tanstack/react-query"

import { createApiHooksFor } from "@/lib/api-factory"
import { createBulkDeleteHook, createBulkUpdateHook } from "@/lib/api-bulk-hooks"
import { apiClient } from "@/lib/api-client"
import type { Brand } from "./brand.schema"
import type { BrandFormValues } from "./brand.schema"

const brandApiHooks = createApiHooksFor<Brand, BrandFormValues>("brands")

interface BrandOption {
  id: string
  name: string
}

export const useBrands = brandApiHooks.useGetList
export const useBrandOptions = () => {
  return useQuery<BrandOption[], Error>({
    queryKey: ["brand-options"],
    queryFn: async () => (await apiClient.get("/brands/options")).data,
  })
}
export const useCreateBrand = brandApiHooks.useCreateWithFormData
export const useUpdateBrand = brandApiHooks.useUpdateWithFormData
export const usePartialUpdateBrand = brandApiHooks.useUpdate
export const useDeleteBrand = brandApiHooks.useDelete

export const useDeleteManyBrands = createBulkDeleteHook<Brand>("brands")
export const useUpdateManyBrands = createBulkUpdateHook<Brand>("brands")
export const useBrand = brandApiHooks.useGetOne