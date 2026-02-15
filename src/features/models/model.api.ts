import { useQuery } from "@tanstack/react-query"

import { createApiHooksFor } from "@/lib/api-factory"
import { createBulkDeleteHook, createBulkUpdateHook } from "@/lib/api-bulk-hooks"
import { apiClient } from "@/lib/api-client"
import type { Model } from "./model.schema"
import type { ModelFormValues } from "./model.schema"

const modelApiHooks = createApiHooksFor<Model, ModelFormValues>("models")

interface ModelOption {
  id: string
  name: string
}

export const useModels = modelApiHooks.useGetList
export const useModelOptions = () => {
  return useQuery<ModelOption[], Error>({
    queryKey: ["model-options"],
    queryFn: async () => (await apiClient.get("/models/options")).data,
  })
}
export const useCreateModel = modelApiHooks.useCreate
export const useUpdateModel = modelApiHooks.useUpdate
export const usePartialUpdateModel = modelApiHooks.useUpdate
export const useDeleteModel = modelApiHooks.useDelete

export const useDeleteManyModels = createBulkDeleteHook<Model>("models")
export const useUpdateManyModels = createBulkUpdateHook<Model>("models")
export const useModel = modelApiHooks.useGetOne
