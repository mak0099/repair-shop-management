import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { apiClient } from "@/lib/api-client"

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function createBulkDeleteHook<TResource extends { id: string }>(resourceName: string) {
  const pluralResourceName = capitalize(resourceName)

  return () => {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: (ids: string[]) => apiClient.delete(resourceName, { data: { ids } }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [resourceName] })
        toast.success(`${pluralResourceName} deleted successfully.`)
      },
      onError: (error: Error) => {
        toast.error(`Failed to delete ${pluralResourceName.toLowerCase()}: ${error.message}`)
      },
    })
  }
}

export function createBulkUpdateHook<TResource extends { id: string }>(resourceName: string) {
  const pluralResourceName = capitalize(resourceName)

  return () => {
    const queryClient = useQueryClient()
    return useMutation({
      mutationFn: ({ ids, data }: { ids: string[]; data: Partial<Omit<TResource, "id">> }) =>
        apiClient.patch(resourceName, { ids, data }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [resourceName] })
        toast.success(`${pluralResourceName} updated successfully.`)
      },
      onError: (error: Error) => {
        toast.error(`Failed to update ${pluralResourceName.toLowerCase()}: ${error.message}`)
      },
    })
  }
}