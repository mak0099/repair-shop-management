"use client"
import { createModalContext } from "@/lib/modal-context-factory"
import { Category } from "./category.schema";

const { ModalProvider, useModal } = createModalContext<Category>({
  featureName: "Category",
  formName: "categoryForm",
  modalClassName: "max-w-lg",
  addDescription: "Create a new category.",
  editDescription: "Update category details.",
  viewDescription: "View category details.",
})

export const CategoryModalProvider = ModalProvider
export const useCategoryModal = useModal
