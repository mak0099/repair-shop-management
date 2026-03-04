"use client"

import { createApiHooksFor } from "@/lib/api-factory"
import { createBulkDeleteHook } from "@/lib/api-bulk-hooks"
import type { SaleReturn, ReturnFormValues } from "./returns.schema"

/**
 * Returns API Hooks
 * Endpoint: "returns"
 */
const returnApiHooks = createApiHooksFor<SaleReturn, ReturnFormValues, Partial<ReturnFormValues>>("returns")

export const useReturns = returnApiHooks.useGetList
export const useReturn = returnApiHooks.useGetOne
export const useCreateReturn = returnApiHooks.useCreate
export const useDeleteReturn = returnApiHooks.useDelete
export const useDeleteManyReturns = createBulkDeleteHook("returns")