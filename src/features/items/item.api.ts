import { useQuery } from "@tanstack/react-query"

import { createApiHooksFor } from "@/lib/api-factory"
import { createBulkDeleteHook, createBulkUpdateHook } from "@/lib/api-bulk-hooks"
import { apiClient } from "@/lib/api-client"
import type { Item } from "./item.schema"
import type { ItemFormValues } from "./item.schema"

const itemApiHooks = createApiHooksFor<Item, ItemFormValues>("items")

interface ItemOption {
  id: string
  name: string
}

export const useItems = itemApiHooks.useGetList
export const useItemOptions = () => {
  return useQuery<ItemOption[], Error>({
    queryKey: ["item-options"],
    queryFn: async () => (await apiClient.get("/items/options")).data,
  })
}
export const useCreateItem = itemApiHooks.useCreate
export const useUpdateItem = itemApiHooks.useUpdate
export const usePartialUpdateItem = itemApiHooks.useUpdate
export const useDeleteItem = itemApiHooks.useDelete

export const useDeleteManyItems = createBulkDeleteHook<Item>("items")
export const useUpdateManyItems = createBulkUpdateHook<Item>("items")
export const useItem = itemApiHooks.useGetOne
