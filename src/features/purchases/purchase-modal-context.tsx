"use client"

import { createModalContext } from "@/lib/modal-context-factory"
import { ProductPurchase } from "./purchases.schema"

const { ModalProvider, useModal } = createModalContext<ProductPurchase>({
  featureName: "Product Purchase",
  formName: "purchaseForm",
  modalClassName: "max-w-7xl max-h-[90vh] overflow-y-auto",
  addDescription: "Create a new purchase voucher to restock inventory.",
  editDescription: "Update purchase details and payment info.",
  viewDescription: "Detailed view of the purchase voucher and items.",
})

export const PurchaseModalProvider = ModalProvider
export const usePurchaseModal = useModal