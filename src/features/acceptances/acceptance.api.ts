import { createApiHooksFor } from "@/lib/api-factory"
import { createBulkDeleteHook, createBulkUpdateHook } from "@/lib/api-bulk-hooks"
import type { Acceptance, FormData as AcceptanceFormData } from "./acceptance.schema"

/**
 * Standard API hooks for single resource operations.
 */
const acceptanceApiHooks = createApiHooksFor<Acceptance, AcceptanceFormData>("acceptances")

export const useAcceptances = acceptanceApiHooks.useGetList
export const useAcceptance = acceptanceApiHooks.useGetOne
export const useCreateAcceptance = acceptanceApiHooks.useCreateWithFormData
export const useUpdateAcceptance = acceptanceApiHooks.useUpdateWithFormData
export const usePartialUpdateAcceptance = acceptanceApiHooks.useUpdate
export const useDeleteAcceptance = acceptanceApiHooks.useDelete

/**
 * Hooks for bulk operations.
 * Note: createBulkDeleteHook no longer requires a generic type argument.
 */
export const useDeleteManyAcceptances = createBulkDeleteHook("acceptances")
export const useUpdateManyAcceptances = createBulkUpdateHook<Acceptance>("acceptances")