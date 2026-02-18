"use client"
import { createModalContext } from "@/lib/modal-context-factory"
import { Brand } from "./brand.schema";

const { ModalProvider, useModal } = createModalContext<Brand>({
  featureName: "Brand",
  formName: "brandForm",
  modalClassName: "max-w-lg",
  addDescription: "Create a new device brand.",
  editDescription: "Update the details of this brand.",
  viewDescription: "View brand details.",
})

export const BrandModalProvider = ModalProvider
export const useBrandModal = useModal