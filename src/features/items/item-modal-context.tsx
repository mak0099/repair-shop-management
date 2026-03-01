"use client"
import { createModalContext } from "@/lib/modal-context-factory"
import { Item } from "./item.schema"

const { ModalProvider, useModal } = createModalContext<Item>({
  featureName: "Product",
  formName: "itemForm",
  modalClassName: "max-w-7xl max-h-[95vh] overflow-y-auto",
  addDescription: "Create a new inventory item.",
  editDescription: "Update item details.",
  viewDescription: "View item details.",
})

export const ItemModalProvider = ModalProvider
export const useItemModal = useModal
