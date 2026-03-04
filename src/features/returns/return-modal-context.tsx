"use client"

import { createModalContext } from "@/lib/modal-context-factory"
import { SaleReturn } from "./returns.schema"

const { ModalProvider, useModal } = createModalContext<SaleReturn>({
  featureName: "Sale Return",
  formName: "returnForm",
  modalClassName: "max-w-4xl max-h-[90vh] overflow-y-auto",
  addDescription: "Process a new sales return and restock inventory.",
  viewDescription: "View return transaction details and refund info.",
})

export const ReturnModalProvider = ModalProvider
export const useReturnModal = useModal