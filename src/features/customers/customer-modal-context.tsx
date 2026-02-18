"use client"

import { createModalContext } from "@/lib/modal-context-factory"
import { Customer } from "./customer.schema"

const { ModalProvider, useModal } = createModalContext<Customer>({
  featureName: "Customer",
  formName: "customerForm",
  modalClassName: "max-w-4xl max-h-[90vh] overflow-y-auto",
  addDescription: "Create a new customer record.",
  viewDescription: "View customer details.",
  editDescription: "Update customer details.",
})

export const CustomerModalProvider = ModalProvider
export const useCustomerModal = useModal