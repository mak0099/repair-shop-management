"use client"

import { createModalContext } from "@/lib/modal-context-factory"
import { Buyback } from "./buyback.schema"

const { ModalProvider, useModal } = createModalContext<Buyback>({
  featureName: "Customer Buyback",
  formName: "buybackForm",
  modalClassName: "max-w-7xl max-h-[90vh] overflow-y-auto",
  addDescription: "Register a new device buyback from a customer.",
  editDescription: "Update the buyback details.",
  viewDescription: "Detailed view of the buyback record.",
})

export const BuybackModalProvider = ModalProvider
export const useBuybackModal = useModal