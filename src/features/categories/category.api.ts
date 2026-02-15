import { useQuery } from "@tanstack/react-query"

import { createApiHooksFor } from "@/lib/api-factory"
import { createBulkDeleteHook, createBulkUpdateHook } from "@/lib/api-bulk-hooks"
import { apiClient } from "@/lib/api-client"
import type { Category } from "./category.schema"
import type { CategoryFormValues } from "./category.schema"

const categoryApiHooks = createApiHooksFor<Category, CategoryFormValues>("categories")

interface CategoryOption {
  id: string
  name: string
}

export const useCategories = categoryApiHooks.useGetList
export const useCategoryOptions = (parentId?: string) => {
  const queryParams = new URLSearchParams();
  if (parentId) {
    queryParams.append("parentId", parentId);
  }
  return useQuery<CategoryOption[], Error>({
    queryKey: ["category-options", parentId],
    queryFn: async () => (await apiClient.get(`/categories/options?${queryParams.toString()}`)).data,
  })
}
export const useCreateCategory = categoryApiHooks.useCreate
export const useUpdateCategory = categoryApiHooks.useUpdate
export const usePartialUpdateCategory = categoryApiHooks.useUpdate
export const useDeleteCategory = categoryApiHooks.useDelete

export const useDeleteManyCategories = createBulkDeleteHook<Category>("categories")
export const useUpdateManyCategories = createBulkUpdateHook<Category>("categories")
export const useCategory = categoryApiHooks.useGetOne
