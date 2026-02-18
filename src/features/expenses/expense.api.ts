import { useQuery } from "@tanstack/react-query"

import { createApiHooksFor } from "@/lib/api-factory"
import { createBulkDeleteHook, createBulkUpdateHook } from "@/lib/api-bulk-hooks"
import { apiClient } from "@/lib/api-client"
import type { Expense } from "./expense.schema"
import type { ExpenseFormValues } from "./expense.schema"

const expenseApiHooks = createApiHooksFor<Expense, ExpenseFormValues>("expenses")

interface ExpenseOption {
  id: string
  title: string
}

export const useExpenses = expenseApiHooks.useGetList
export const useExpenseOptions = () => {
  return useQuery<ExpenseOption[], Error>({
    queryKey: ["expense-options"],
    queryFn: async () => (await apiClient.get("/expenses/options")).data,
  })
}
export const useCreateExpense = expenseApiHooks.useCreateWithFormData
export const useUpdateExpense = expenseApiHooks.useUpdateWithFormData
export const usePartialUpdateExpense = expenseApiHooks.useUpdate
export const useDeleteExpense = expenseApiHooks.useDelete

export const useDeleteManyExpenses = createBulkDeleteHook<Expense>("expenses")
export const useExpense = expenseApiHooks.useGetOne
