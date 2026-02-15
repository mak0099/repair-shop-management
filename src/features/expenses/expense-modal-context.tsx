"use client"
import React, { createContext, useCallback, useContext, ReactNode } from "react";
import { useGlobalModal } from "@/components/shared/global-modal-context";
import { Expense } from "./expense.schema";
interface ExpenseModalOptions {
  initialData?: Expense;
  onSuccess?: (data: Expense) => void;
  isViewMode?: boolean;
}
interface ExpenseModalContextType {
  openModal: (options?: ExpenseModalOptions) => void;
  closeModal: () => void;
}

const ExpenseModalContext = createContext<ExpenseModalContextType | undefined>(
  undefined
);

export function ExpenseModalProvider({ children }: { children: ReactNode }) {
  const { openModal: openGlobalModal, closeModal: closeGlobalModal } =
    useGlobalModal();

  const openModal = useCallback(
    (options?: ExpenseModalOptions) => {
      const { initialData, onSuccess, isViewMode } = options || {};
      const isEditMode = !!initialData && !isViewMode;

      let title = "Add New Expense";
      let description = "Record a new business expense.";
      if (isViewMode) {
        title = "View Expense";
        description = "View expense details.";
      } else if (isEditMode) {
        title = "Edit Expense";
        description = "Update expense details.";
      }

      openGlobalModal("expenseForm", {
        title,
        description,
        className: "max-w-lg",
        initialData: initialData,
        isViewMode: isViewMode,
        onSuccess: (data: unknown) => {
          onSuccess?.(data as Expense);
          closeGlobalModal();
        },
      });
    },
    [openGlobalModal, closeGlobalModal]
  );

  const closeModal = useCallback(() => closeGlobalModal(), [closeGlobalModal]);

  return <ExpenseModalContext.Provider value={{ openModal, closeModal }}>{children}</ExpenseModalContext.Provider>;
}

export function useExpenseModal() {
  const context = useContext(ExpenseModalContext);
  if (context === undefined) {
    throw new Error(
      "useExpenseModal must be used within a ExpenseModalProvider"
    );
  }
  return context;
}
