import React from "react"

import { AddBrandModalProvider } from "@/features/brands/add-brand-modal-context"
import { BrandForm } from "@/features/brands/components/brand-form"
import { AddCustomerModalProvider } from "@/features/customers/add-customer-modal-context"
import { CustomerForm } from "@/features/customers/components/customer-form"

// 1. Define a structure for each modal configuration
interface ModalConfig {
  type: string
  contentComponent: React.ComponentType<Record<string, unknown>> // The form component
  providerComponent: React.ComponentType<{ children: React.ReactNode }> // The context provider
}

// 2. Create the configuration array. This is the ONLY file you'll need to edit for new modals.
export const modalRegistry: readonly ModalConfig[] = [
  {
    type: "brandAdd",
    contentComponent: BrandForm,
    providerComponent: AddBrandModalProvider,
  },
  {
    type: "customerAdd",
    contentComponent: CustomerForm,
    providerComponent: AddCustomerModalProvider,
  },
] as const // Using 'as const' for better type inference

// 3. Dynamically create a union type for all modal types for type safety
export type ModalType = (typeof modalRegistry)[number]["type"]