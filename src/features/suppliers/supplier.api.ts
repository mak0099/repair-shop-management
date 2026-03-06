"use client"

import { createApiHooksFor } from "@/lib/api-factory"
import { createBulkDeleteHook, createBulkUpdateHook } from "@/lib/api-bulk-hooks"
import type { Supplier } from "./supplier.schema"

const supplierApiHooks = createApiHooksFor<Supplier, Partial<Supplier>>("suppliers")

export interface SupplierOption {
  id: string
  name: string
}

export const useSuppliers = supplierApiHooks.useGetList
export const useSupplierOptions = supplierApiHooks.useGetOptions<SupplierOption>
export const useCreateSupplier = supplierApiHooks.useCreate
export const useUpdateSupplier = supplierApiHooks.useUpdate
export const usePartialUpdateSupplier = supplierApiHooks.useUpdate
export const useDeleteSupplier = supplierApiHooks.useDelete

export const useDeleteManySuppliers = createBulkDeleteHook("suppliers")
export const useUpdateManySuppliers = createBulkUpdateHook<Supplier>("suppliers")
export const useSupplier = supplierApiHooks.useGetOne
