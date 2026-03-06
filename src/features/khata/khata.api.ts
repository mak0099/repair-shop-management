"use client"

import { createApiHooksFor } from "@/lib/api-factory"
import { createBulkDeleteHook, createBulkUpdateHook } from "@/lib/api-bulk-hooks"
import type { KhataEntry } from "./khata.schema"

const khataApiHooks = createApiHooksFor<KhataEntry, Partial<KhataEntry>>("khata")

export const useKhata = khataApiHooks.useGetList
export const useCreateKhata = khataApiHooks.useCreate
export const usePartialUpdateKhata = khataApiHooks.useUpdate
export const useDeleteKhata = khataApiHooks.useDelete

export const useDeleteManyKhata = createBulkDeleteHook("khata")
export const useUpdateManyKhata = createBulkUpdateHook<KhataEntry>("khata")
export const useKhataEntry = khataApiHooks.useGetOne