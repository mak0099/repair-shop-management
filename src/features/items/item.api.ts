"use client"

import { createApiHooksFor } from "@/lib/api-factory"
import { createBulkDeleteHook, createBulkUpdateHook } from "@/lib/api-bulk-hooks"
import type { Item, ItemFormValues } from "./item.schema"

/**
 * Item API Hooks with Partial update support for isActive toggles.
 */
const itemApiHooks = createApiHooksFor<Item, ItemFormValues, Partial<ItemFormValues>>("items")

export interface ItemOption {
  id: string
  name: string
  [key: string]: unknown // Support extra fields like salePrice, condition, etc.
}

export const useItems = itemApiHooks.useGetList
export const useItemOptions = itemApiHooks.useGetOptions<ItemOption>
export const useCreateItem = itemApiHooks.useCreate
export const useUpdateItem = itemApiHooks.useUpdate
export const usePartialUpdateItem = itemApiHooks.useUpdate
export const useDeleteItem = itemApiHooks.useDelete

export const useDeleteManyItems = createBulkDeleteHook("items")
export const useUpdateManyItems = createBulkUpdateHook<Item>("items")
export const useItem = itemApiHooks.useGetOne