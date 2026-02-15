import { useQuery } from "@tanstack/react-query"

import { createApiHooksFor } from "@/lib/api-factory"
import { createBulkDeleteHook, createBulkUpdateHook } from "@/lib/api-bulk-hooks"
import { apiClient } from "@/lib/api-client"
import type { Supplier } from "./supplier.schema"
import type { SupplierFormValues } from "./supplier.schema"

const supplierApiHooks = createApiHooksFor<Supplier, SupplierFormValues>("suppliers")

interface SupplierOption {
  id: string
  company_name: string
}

export const useSuppliers = supplierApiHooks.useGetList
export const useSupplierOptions = () => {
  return useQuery<SupplierOption[], Error>({
    queryKey: ["supplier-options"],
    queryFn: async () => (await apiClient.get("/suppliers/options")).data,
  })
}
export const useCreateSupplier = supplierApiHooks.useCreate
export const useUpdateSupplier = supplierApiHooks.useUpdate
export const usePartialUpdateSupplier = supplierApiHooks.useUpdate
export const useDeleteSupplier = supplierApiHooks.useDelete

export const useDeleteManySuppliers = createBulkDeleteHook<Supplier>("suppliers")
export const useUpdateManySuppliers = createBulkUpdateHook<Supplier>("suppliers")
export const useSupplier = supplierApiHooks.useGetOne
