"use client"

import axios from "axios" // আপনার এপিআই ইন্সট্যান্স বা সরাসরি এক্সিওস
import { createApiHooksFor } from "@/lib/api-factory"
import { createBulkDeleteHook } from "@/lib/api-bulk-hooks"
import type { Quotation, QuotationFormValues } from "./quotations.schema"

/**
 * Quotation API Hooks
 */
const quotationApiHooks = createApiHooksFor<Quotation, QuotationFormValues, Partial<QuotationFormValues>>("quotations")

export const useQuotations = quotationApiHooks.useGetList
export const useQuotation = quotationApiHooks.useGetOne
export const useCreateQuotation = quotationApiHooks.useCreate
export const useUpdateQuotation = quotationApiHooks.useUpdate
export const useDeleteQuotation = quotationApiHooks.useDelete

export const useDeleteManyQuotations = createBulkDeleteHook("quotations")

/**
 * ২. আইটেম ডিটেইলস ফেচ করার ফাংশন
 * এটি কোটেশন ফর্মে আইটেম অ্যাড করার সময় কল হবে।
 */
export const fetchItemDetailsForQuotation = async (productId: string) => {
  // আপনার সিস্টেমের আইটেম এন্ডপয়েন্ট কল করছে
  const response = await axios.get(`/quotations/items/${productId}`)
  return response.data
}