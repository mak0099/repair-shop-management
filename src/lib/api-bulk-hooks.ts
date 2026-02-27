"use client"

import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query"
import { toast } from "sonner"
import { apiClient } from "@/lib/api-client"

/**
 * Capitalizes the first letter of a given string.
 */
function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Hook factory for performing bulk delete operations.
 * Generic TResource is removed here as it is not required for delete operations,
 * ensuring clean and warning-free code.
 */
export function createBulkDeleteHook(resourceName: string) {
  const pluralResourceName = capitalize(resourceName)

  return (): UseMutationResult<void, Error, string[], unknown> => {
    const queryClient = useQueryClient()
    
    return useMutation({
      mutationFn: async (ids: string[]) => {
        await apiClient.delete(resourceName, { data: { ids } })
      },
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

/**
 * Hook factory for performing bulk update operations.
 * TResource is used as the response type to ensure strong typing 
 * and prevent unused generic warnings.
 */
export function createBulkUpdateHook<TResource extends { id: string }>(resourceName: string) {
  const pluralResourceName = capitalize(resourceName)

  return (): UseMutationResult<
    TResource[], 
    Error, 
    { ids: string[]; data: Record<string, unknown> }, 
    unknown
  > => {
    const queryClient = useQueryClient()

    return useMutation({
      mutationFn: async ({ ids, data }) => {
        /** * Using Record<string, unknown> for the data payload satisfies 
         * ESLint rules while maintaining object-level type safety. 
         */
        const response = await apiClient.patch<TResource[]>(resourceName, { ids, data })
        return response.data
      },
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