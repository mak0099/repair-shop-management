"use client"

import { createApiHooksFor } from "@/lib/api-factory"
import { createBulkDeleteHook } from "@/lib/api-bulk-hooks"
import type { Buyback, BuybackFormValues } from "./buyback.schema"

const buybackApiHooks = createApiHooksFor<Buyback, BuybackFormValues, Partial<BuybackFormValues>>("buybacks")

export const useBuybacks = buybackApiHooks.useGetList
export const useBuyback = buybackApiHooks.useGetOne
export const useCreateBuyback = buybackApiHooks.useCreate
export const useUpdateBuyback = buybackApiHooks.useUpdate
export const useDeleteBuyback = buybackApiHooks.useDelete
export const useDeleteManyBuybacks = createBulkDeleteHook("buybacks")