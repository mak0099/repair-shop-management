"use client"

import { createApiHooksFor } from "@/lib/api-factory"
import { createBulkDeleteHook } from "@/lib/api-bulk-hooks"
import type { Quotation, QuotationFormValues } from "./quotations.schema"

/**
 * Quotation API Hooks using centralized factory.
 * Endpoint: "quotations"
 */
const quotationApiHooks = createApiHooksFor<Quotation, QuotationFormValues, Partial<QuotationFormValues>>("quotations")

export const useQuotations = quotationApiHooks.useGetList
export const useQuotation = quotationApiHooks.useGetOne
export const useCreateQuotation = quotationApiHooks.useCreate
export const useUpdateQuotation = quotationApiHooks.useUpdate
export const useDeleteQuotation = quotationApiHooks.useDelete

// Bulk actions for table management
export const useDeleteManyQuotations = createBulkDeleteHook("quotations")