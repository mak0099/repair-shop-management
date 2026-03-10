"use client"
import { createModalContext } from "@/lib/modal-context-factory"
import type { KhataEntry } from "./khata.schema"

export interface KhataModalOptions {
  initialData?: KhataEntry | null
  onSuccess?: (data: KhataEntry) => void
  isViewMode?: boolean
  partyId?: string // কোনো নির্দিষ্ট সাপ্লায়ারের জন্য পেমেন্ট করার সময় লাগবে
}

const { ModalProvider, useModal } = createModalContext<KhataEntry, KhataModalOptions>({
  featureName: "Khata Adjustment",
  formName: "khataForm",
  addTitle: "Transaction Adjustment",
  editTitle: "Update Transaction",
  viewTitle: "View Transaction",
  modalClassName: "max-w-3xl max-h-[95vh] overflow-y-auto",
  addDescription: "Record a new financial transaction.",
  editDescription: "Update transaction entry details.",
  viewDescription: "View transaction details.",
})

export const KhataModalProvider = ModalProvider
export const useKhataModal = useModal