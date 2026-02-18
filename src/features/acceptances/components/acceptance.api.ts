"use client"

import { createApiHooksFor } from "@/lib/api-factory"
import { createBulkDeleteHook, createBulkUpdateHook } from "@/lib/api-bulk-hooks"
import { Acceptance, FormData as AcceptanceFormValues } from "./acceptance.schema"

const acceptanceApiHooks = createApiHooksFor<Acceptance, AcceptanceFormValues>("acceptances")

export const useAcceptances = acceptanceApiHooks.useGetList
export const useCreateAcceptance = acceptanceApiHooks.useCreateWithFormData
export const useUpdateAcceptance = acceptanceApiHooks.useUpdateWithFormData
export const usePartialUpdateAcceptance = acceptanceApiHooks.useUpdate
export const useDeleteAcceptance = acceptanceApiHooks.useDelete

export const useDeleteManyAcceptances = createBulkDeleteHook<Acceptance>("acceptances")
export const useUpdateManyAcceptances = createBulkUpdateHook<Acceptance>("acceptances")
export const useAcceptance = acceptanceApiHooks.useGetOne