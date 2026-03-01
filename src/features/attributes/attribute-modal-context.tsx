"use client";
import { createModalContext } from "@/lib/modal-context-factory";
import { Attribute } from "./attribute.schema";

const { ModalProvider, useModal } = createModalContext<Attribute, { title?: string }>({
  featureName: "Attribute",
  formName: "attributeForm",
  modalClassName: "max-w-lg",
  addTitle: "Add New Attribute",
  addDescription: "Create a new product attribute (e.g. Color, Size).",
  editTitle: "Edit Attribute",
  editDescription: "Update the details of this attribute.",
  viewTitle: "View Attribute",
  viewDescription: "View attribute details.",
});

export const AttributeModalProvider = ModalProvider;
export const useAttributeModal = useModal;