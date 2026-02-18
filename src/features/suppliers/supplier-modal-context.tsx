"use client"
import { createModalContext } from "@/lib/modal-context-factory"
import { Supplier } from "./supplier.schema";

const { ModalProvider, useModal } = createModalContext<Supplier>({
  featureName: "Supplier",
  formName: "supplierForm",
  modalClassName: "max-w-3xl",
  addDescription: "Create a new supplier.",
  editDescription: "Update supplier details.",
  viewDescription: "View supplier details.",
})

export const SupplierModalProvider = ModalProvider
export const useSupplierModal = useModal
