import React from "react"

import { BrandModalProvider } from "@/features/brands/brand-modal-context"
import { BrandForm } from "@/features/brands/components/brand-form"
import { CustomerModalProvider } from "@/features/customers/customer-modal-context"
import { CustomerForm } from "@/features/customers/components/customer-form"
import { ItemModalProvider } from "@/features/items/item-modal-context"
import { ItemForm } from "@/features/items/components/item-form"
import { ModelModalProvider } from "@/features/models/model-modal-context"
import { ModelForm } from "@/features/models/components/model-form"
import { MasterSettingModalProvider } from "@/features/master-settings/master-setting-modal-context"
import { MasterSettingForm } from "@/features/master-settings/components/master-setting-form"
import { UserModalProvider } from "@/features/users/user-modal-context"
import { UserForm } from "@/features/users/components/user-form"
import { CategoryModalProvider } from "@/features/categories/category-modal-context"
import { CategoryForm } from "@/features/categories/components/category-form"
import { SupplierModalProvider } from "@/features/suppliers/supplier-modal-context"
import { SupplierForm } from "@/features/suppliers/components/supplier-form"
import { ExpenseModalProvider } from "@/features/expenses/expense-modal-context"
import { ExpenseForm } from "@/features/expenses/components/expense-form"

// 1. Define a structure for each modal configuration
interface ModalConfig {
  type: string
  contentComponent: React.ComponentType<Record<string, unknown>> // The form component
  providerComponent: React.ComponentType<{ children: React.ReactNode }> // The context provider
}

// 2. Create the configuration array. This is the ONLY file you'll need to edit for new modals.
export const modalRegistry: readonly ModalConfig[] = [
  {
    type: "brandForm",
    contentComponent: BrandForm,
    providerComponent: BrandModalProvider,
  },
  {
    type: "customerForm",
    contentComponent: CustomerForm,
    providerComponent: CustomerModalProvider,
  },
  {
    type: "itemForm",
    contentComponent: ItemForm,
    providerComponent: ItemModalProvider,
  },
  {
    type: "modelForm",
    contentComponent: ModelForm,
    providerComponent: ModelModalProvider,
  },
  {
    type: "masterSettingForm",
    contentComponent: MasterSettingForm,
    providerComponent: MasterSettingModalProvider,
  },
  {
    type: "userForm",
    contentComponent: UserForm,
    providerComponent: UserModalProvider,
  },
  {
    type: "categoryForm",
    contentComponent: CategoryForm,
    providerComponent: CategoryModalProvider,
  },
  {
    type: "supplierForm",
    contentComponent: SupplierForm,
    providerComponent: SupplierModalProvider,
  },
  {
    type: "expenseForm",
    contentComponent: ExpenseForm,
    providerComponent: ExpenseModalProvider,
  },
] as const // Using 'as const' for better type inference

// 3. Dynamically create a union type for all modal types for type safety
export type ModalType = (typeof modalRegistry)[number]["type"]