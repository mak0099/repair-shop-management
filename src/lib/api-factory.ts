"use client"

import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
  type UseQueryResult,
  type UseMutationResult,
} from "@tanstack/react-query"
import { apiClient } from "./api-client"

/**
 * Basic structure for any resource in the system.
 */
interface Resource {
  id: string
}

/**
 * Standard paginated response structure from the API.
 */
interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

/**
 * Internal helper to convert a generic object into FormData.
 * Uses Record<string, unknown> to satisfy strict type checking and ESLint rules.
 */
const convertToFormData = <T>(data: T): FormData => {
  const payload = new FormData()
  const dataMap = data as Record<string, unknown>

  Object.entries(dataMap).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      if (value instanceof File) {
        payload.append(key, value)
      } else if (value instanceof Date) {
        payload.append(key, value.toISOString())
      } else if (Array.isArray(value)) {
        // Handle array values by appending them with square brackets
        value.forEach((v) => payload.append(`${key}[]`, String(v)))
      } else {
        payload.append(key, String(value))
      }
    }
  })

  return payload
}

/**
 * Factory to create standardized React Query hooks for any API resource.
 */
export function createApiHooksFor<
  TResource extends Resource,
  TCreateParams,
  TUpdateParams = TCreateParams,
>(resourceName: string) {
  const resourceQueryKey = [resourceName]

  /**
   * Hook for fetching a paginated list of resources.
   */
  const useGetList = (
    params: Record<string, unknown> = {}
  ): UseQueryResult<PaginatedResponse<TResource>, Error> => {
    return useQuery({
      queryKey: [...resourceQueryKey, params],
      queryFn: async () => {
        const response = await apiClient.get<PaginatedResponse<TResource>>(`/${resourceName}`, {
          params,
        })
        return response.data
      },
      placeholderData: keepPreviousData,
    })
  }

  /**
   * Hook for fetching a single resource by ID.
   */
  const useGetOne = (id: string | null | undefined): UseQueryResult<TResource, Error> => {
    return useQuery({
      queryKey: [...resourceQueryKey, id],
      queryFn: async () => {
        if (!id) throw new Error("ID is required")
        const response = await apiClient.get<TResource>(`/${resourceName}/${id}`)
        return response.data
      },
      enabled: !!id,
    })
  }

  /**
   * Hook for creating a new resource using JSON.
   */
  const useCreate = (): UseMutationResult<TResource, Error, TCreateParams> => {
    const queryClient = useQueryClient()
    return useMutation<TResource, Error, TCreateParams>({
      mutationFn: async (data) => {
        const response = await apiClient.post<TResource>(`/${resourceName}`, data)
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: resourceQueryKey })
        queryClient.invalidateQueries({ queryKey: [`${resourceName}-options`] })
      },
    })
  }

  /**
   * Hook for creating a new resource using multipart/form-data.
   * Useful for file uploads.
   */
  const useCreateWithFormData = (): UseMutationResult<TResource, Error, TCreateParams> => {
    const queryClient = useQueryClient()
    return useMutation<TResource, Error, TCreateParams>({
      mutationFn: async (data) => {
        const payload = convertToFormData(data)
        const response = await apiClient.post<TResource>(`/${resourceName}`, payload)
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: resourceQueryKey })
        queryClient.invalidateQueries({ queryKey: [`${resourceName}-options`] })
      },
    })
  }

  /**
   * Hook for updating an existing resource using JSON (PATCH).
   */
  const useUpdate = (): UseMutationResult<TResource, Error, { id: string; data: TUpdateParams }> => {
    const queryClient = useQueryClient()
    return useMutation<TResource, Error, { id: string; data: TUpdateParams }>({
      mutationFn: async ({ id, data }) => {
        const response = await apiClient.patch<TResource>(`/${resourceName}/${id}`, data)
        return response.data
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: resourceQueryKey })
        queryClient.invalidateQueries({ queryKey: [...resourceQueryKey, data.id] })
        queryClient.invalidateQueries({ queryKey: [`${resourceName}-options`] })
      },
    })
  }

  /**
   * Hook for updating an existing resource using FormData.
   * Uses POST with _method spoofing for wider backend compatibility.
   */
  const useUpdateWithFormData = (): UseMutationResult<
    TResource,
    Error,
    { id: string; data: TUpdateParams }
  > => {
    const queryClient = useQueryClient()
    return useMutation<TResource, Error, { id: string; data: TUpdateParams }>({
      mutationFn: async ({ id, data }) => {
        const payload = convertToFormData(data)
        payload.append("_method", "PUT")
        const response = await apiClient.post<TResource>(`/${resourceName}/${id}`, payload)
        return response.data
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: resourceQueryKey })
        queryClient.invalidateQueries({ queryKey: [...resourceQueryKey, data.id] })
        queryClient.invalidateQueries({ queryKey: [`${resourceName}-options`] })
      },
    })
  }

  /**
   * Hook for deleting a resource by ID.
   */
  const useDelete = (): UseMutationResult<void, Error, string> => {
    const queryClient = useQueryClient()
    return useMutation<void, Error, string>({
      mutationFn: async (id: string) => {
        await apiClient.delete(`/${resourceName}/${id}`)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: resourceQueryKey })
        queryClient.invalidateQueries({ queryKey: [`${resourceName}-options`] })
      },
    })
  }

  /**
   * Hook for fetching simplified options (id/label) for select components.
   */
  const useGetOptions = <TOption extends { id: string }>(
    params: Record<string, unknown> = {},
    queryOptions: { enabled?: boolean } = {}
  ): UseQueryResult<TOption[], Error> => {
    return useQuery({
      queryKey: [`${resourceName}-options`, params],
      queryFn: async () => {
        const response = await apiClient.get<TOption[]>(`/${resourceName}/options`, {
          params,
        })
        return response.data
      },
      staleTime: 5 * 60 * 1000,
      ...queryOptions,
    })
  }

  return {
    useGetList,
    useGetOne,
    useCreate,
    useCreateWithFormData,
    useUpdate,
    useUpdateWithFormData,
    useDelete,
    useGetOptions,
  }
}