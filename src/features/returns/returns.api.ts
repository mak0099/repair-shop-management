"use client"

import axios from "axios"
import { createApiHooksFor } from "@/lib/api-factory"
import { createBulkDeleteHook } from "@/lib/api-bulk-hooks"
import { SaleReturn } from "./returns.schema"
import { Sale } from "@/features/sales/sales.schema"

const returnApiHooks = createApiHooksFor<SaleReturn>("returns")

export const useReturns = returnApiHooks.useGetList
export const useReturn = returnApiHooks.useGetOne
export const useCreateReturn = returnApiHooks.useCreate
export const useUpdateReturn = returnApiHooks.useUpdate
export const useDeleteReturn = returnApiHooks.useDelete
export const useDeleteManyReturns = createBulkDeleteHook("returns")

// Helper to fetch sale by invoice number
export const fetchSaleByInvoice = async (invoiceNumber: string): Promise<Sale | null> => {
  try {
    // In a real API: GET /sales?invoiceNumber=INV-123
    // Using search param for mock/json-server compatibility
    const response = await axios.get(`/sales?search=${invoiceNumber}`)
    const sales = response.data.data || []
    // Exact match check
    const sale = sales.find((s: Sale) => s.invoiceNumber === invoiceNumber)
    return sale || null
  } catch (error) {
    console.error("Failed to fetch sale", error)
    return null
  }
}
