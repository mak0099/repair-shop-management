import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
  type UseQueryResult,
  type UseMutationResult,
} from "@tanstack/react-query"
import { apiClient } from "./api-client"

interface Resource {
  id: string
  [key: string]: any
}

interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

export function createApiHooksFor<
  TResource extends Resource,
  TCreateParams,
  TUpdateParams = TCreateParams,
>(resourceName: string) {
  const resourceQueryKey = [resourceName]

  const useGetList = (
    params: Record<string, any> = {}
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

  const useCreate = (): UseMutationResult<TResource, Error, TCreateParams> => {
    const queryClient = useQueryClient()
    return useMutation<TResource, Error, TCreateParams>({
      mutationFn: async (data) => {
        const response = await apiClient.post<TResource>(`/${resourceName}`, data)
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: resourceQueryKey })
      },
    })
  }

  const useCreateWithFormData = (): UseMutationResult<TResource, Error, TCreateParams> => {
    const queryClient = useQueryClient()
    return useMutation<TResource, Error, TCreateParams>({
      mutationFn: async (data) => {
        const payload = new FormData()
        Object.entries(data as any).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            if (value instanceof File) {
              payload.append(key, value)
            } else if (value instanceof Date) {
              payload.append(key, value.toISOString())
            } else {
              payload.append(key, String(value))
            }
          }
        })
        const response = await apiClient.post<TResource>(`/${resourceName}`, payload)
        return response.data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: resourceQueryKey })
      },
    })
  }

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
      },
    })
  }

  const useUpdateWithFormData = (): UseMutationResult<
    TResource,
    Error,
    { id: string; data: TUpdateParams }
  > => {
    const queryClient = useQueryClient()
    return useMutation<TResource, Error, { id: string; data: TUpdateParams }>({
      mutationFn: async ({ id, data }) => {
        const payload = new FormData()
        Object.entries(data as any).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            if (value instanceof File) {
              payload.append(key, value)
            } else if (value instanceof Date) {
              payload.append(key, value.toISOString())
            } else {
              payload.append(key, String(value))
            }
          }
        })
        payload.append("_method", "PUT")
        const response = await apiClient.post<TResource>(`/${resourceName}/${id}`, payload)
        return response.data
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: resourceQueryKey })
        queryClient.invalidateQueries({ queryKey: [...resourceQueryKey, data.id] })
      },
    })
  }

  const useDelete = (): UseMutationResult<void, Error, string> => {
    const queryClient = useQueryClient()
    return useMutation<void, Error, string>({
      mutationFn: async (id: string) => {
        await apiClient.delete(`/${resourceName}/${id}`)
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [resourceName] })
      },
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
  }
}