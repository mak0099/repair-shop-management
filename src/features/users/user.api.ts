import { useQuery } from "@tanstack/react-query"

import { createApiHooksFor } from "@/lib/api-factory"
import { createBulkDeleteHook, createBulkUpdateHook } from "@/lib/api-bulk-hooks"
import { apiClient } from "@/lib/api-client"
import type { User } from "./user.schema"
import type { UserFormValues } from "./user.schema"

const userApiHooks = createApiHooksFor<User, UserFormValues>("users")

interface UserOption {
  id: string
  name: string
}

export const useUsers = userApiHooks.useGetList
export const useUserOptions = () => {
  return useQuery<UserOption[], Error>({
    queryKey: ["user-options"],
    queryFn: async () => (await apiClient.get("/users/options")).data,
  })
}
export const useCreateUser = userApiHooks.useCreate
export const useUpdateUser = userApiHooks.useUpdate
export const usePartialUpdateUser = userApiHooks.useUpdate
export const useDeleteUser = userApiHooks.useDelete

export const useDeleteManyUsers = createBulkDeleteHook<User>("users")
export const useUpdateManyUsers = createBulkUpdateHook<User>("users")
export const useUser = userApiHooks.useGetOne
