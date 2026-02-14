import { createApiHooksFor } from "@/lib/api-factory"
import { createBulkDeleteHook, createBulkUpdateHook } from "@/lib/api-bulk-hooks"
import type { Acceptance, FormData as AcceptanceFormData } from "./acceptance.schema"

const acceptanceApiHooks = createApiHooksFor<Acceptance, AcceptanceFormData>("acceptances")

export const useAcceptances = acceptanceApiHooks.useGetList
export const useAcceptance = acceptanceApiHooks.useGetOne
// Since the acceptance form includes photo uploads, we use the 'WithFormData' variant.
export const useCreateAcceptance = acceptanceApiHooks.useCreateWithFormData
// Assuming the edit form will also handle photo uploads.
export const useUpdateAcceptance = acceptanceApiHooks.useUpdateWithFormData
// For simple JSON-based partial updates (like changing status).
export const usePartialUpdateAcceptance = acceptanceApiHooks.useUpdate
export const useDeleteAcceptance = acceptanceApiHooks.useDelete

// Hooks for bulk operations
export const useDeleteManyAcceptances = createBulkDeleteHook<Acceptance>("acceptances")
export const useUpdateManyAcceptances = createBulkUpdateHook<Acceptance>("acceptances")
