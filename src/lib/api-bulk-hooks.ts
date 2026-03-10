"use client"

import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query"
import { toast } from "sonner"
import { api } from "@/lib/api-client"

/**
 * Capitalizes the first letter of a given string.
 */
function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Hook factory for performing bulk delete operations.
 * This hook is non-generic as it only requires IDs for deletion.
 */
export function createBulkDeleteHook(resourceName: string) {
  const pluralResourceName = capitalize(resourceName)

  return (): UseMutationResult<void, Error, string[], unknown> => {
    const queryClient = useQueryClient()
    
    return useMutation({
      mutationFn: async (ids: string[]) => {
        await api.delete(resourceName, { data: { ids } })
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
 * FIX: Updated TResource constraint to { id?: string } to support 
 * resources where the ID might be optional in their core schema.
 */
export function createBulkUpdateHook<TResource extends { id?: string }>(resourceName: string) {
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
        /** * Using Record<string, unknown> for the data payload to 
         * maintain type safety while adhering to ESLint rules. 
         */
        const response = await api.patch<TResource[]>(resourceName, { ids, data })
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