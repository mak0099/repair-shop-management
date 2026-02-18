"use client"
import { createModalContext } from "@/lib/modal-context-factory"
import { Expense } from "./expense.schema";

const { ModalProvider, useModal } = createModalContext<Expense>({
  featureName: "Expense",
  formName: "expenseForm",
  modalClassName: "max-w-lg",
  addDescription: "Record a new business expense.",
  editDescription: "Update expense details.",
  viewDescription: "View expense details.",
})

export const ExpenseModalProvider = ModalProvider
export const useExpenseModal = useModal
