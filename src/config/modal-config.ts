import React from "react"

import { BrandForm } from "@/features/brands/components/brand-form"
import { CustomerForm } from "@/features/customers/components/customer-form"
import { ItemForm } from "@/features/items/components/item-form"
import { ModelForm } from "@/features/models/components/model-form"
import { MasterSettingForm } from "@/features/master-settings/components/master-setting-form"
import { UserForm } from "@/features/users/components/user-form"
import { CategoryForm } from "@/features/categories/components/category-form"
import { SupplierForm } from "@/features/suppliers/components/supplier-form"
import { ExpenseForm } from "@/features/expenses/components/expense-form"
import { AcceptanceForm } from "@/features/acceptances/components/acceptance-form"
import { AttributeForm } from "@/features/attributes"
import { PermissionForm } from "@/features/permissions/components/permission-form"
import { StockAdjustmentForm } from "@/features/stock-adjustment"
import { BoxNumberForm } from "@/features/box-numbers"

// 1. Define a structure for each modal configuration
interface ModalConfig {
  type: string
  // We use `any` here because each form component (e.g., AttributeForm, BrandForm)
  // has its own specific props interface for `initialData`. Trying to enforce a
  // single generic type here leads to assignability issues. This is a pragmatic
  // trade-off for creating a dynamic modal registry.
  contentComponent: React.ComponentType<any>
}

// 2. Create the configuration array. This is the ONLY file you'll need to edit for new modals.
const modalRegistry: readonly ModalConfig[] = [
  {
    type: "attributeForm",
    contentComponent: AttributeForm,
  },
  {
    type: "brandForm",
    contentComponent: BrandForm,
  },
  {
    type: "customerForm",
    contentComponent: CustomerForm,
  },
  {
    type: "itemForm",
    contentComponent: ItemForm,
  },
  {
    type: "modelForm",
    contentComponent: ModelForm,
  },
  {
    type: "masterSettingForm",
    contentComponent: MasterSettingForm,
  },
  {
    type: "userForm",
    contentComponent: UserForm,
  },
  {
    type: "categoryForm",
    contentComponent: CategoryForm,
  },
  {
    type: "supplierForm",
    contentComponent: SupplierForm,
  },
  {
    type: "expenseForm",
    contentComponent: ExpenseForm,
  },
  {
    type: "acceptanceForm",
    contentComponent: AcceptanceForm,
  },
  {
    type: "permissionForm",
    contentComponent: PermissionForm,
  },
  {
    type: "stockAdjustmentForm",
    contentComponent: StockAdjustmentForm,
  },
  {
    type: "boxNumberForm",
    contentComponent: BoxNumberForm,
  },
] as const // Using 'as const' for better type inference

// Export a function to defer the evaluation of the registry
export const getModalRegistry = () => modalRegistry;

// 3. Dynamically create a union type for all modal types for type safety
export type ModalType = ReturnType<typeof getModalRegistry>[number]["type"];