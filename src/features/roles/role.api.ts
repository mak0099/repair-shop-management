"use client"

import { createApiHooksFor } from "@/lib/api-factory"
import { createBulkDeleteHook, createBulkUpdateHook } from "@/lib/api-bulk-hooks"
import type { Role, RoleFormValues } from "./role.schema"

/**
 * FIX: Added Partial<RoleFormValues> as the 3rd generic to support partial updates.
 */
const roleApiHooks = createApiHooksFor<Role, RoleFormValues, Partial<RoleFormValues>>("roles")

export interface RoleOption {
  id: string
  name: string
}

export const useRoles = roleApiHooks.useGetList
export const useRoleOptions = roleApiHooks.useGetOptions<RoleOption>
export const useCreateRole = roleApiHooks.useCreate
export const useUpdateRole = roleApiHooks.useUpdate
export const usePartialUpdateRole = roleApiHooks.useUpdate
export const useDeleteRole = roleApiHooks.useDelete

export const useDeleteManyRoles = createBulkDeleteHook("roles")
export const useUpdateManyRoles = createBulkUpdateHook<Role>("roles")
export const useRole = roleApiHooks.useGetOne