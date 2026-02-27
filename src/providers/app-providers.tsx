"use client"

import React from "react"
import { GlobalModalProvider } from "@/components/shared/global-modal-context"
import QueryProvider from "./query-provider"
import { AcceptanceModalProvider } from "@/features/acceptances/acceptance-modal-context"
import { AttributeModalProvider } from "@/features/attributes"
import { BoxNumberModalProvider } from "@/features/box-numbers"
import { BrandModalProvider } from "@/features/brands/brand-modal-context"
import { CategoryModalProvider } from "@/features/categories/category-modal-context"
import { CustomerModalProvider } from "@/features/customers/customer-modal-context"
import { ExpenseModalProvider } from "@/features/expenses/expense-modal-context"
import { ItemModalProvider } from "@/features/items/item-modal-context"
import { MasterSettingModalProvider } from "@/features/master-settings/master-setting-modal-context"
import { ModelModalProvider } from "@/features/models/model-modal-context"
import { PermissionModalProvider } from "@/features/permissions/permission-modal-context"
import { StockAdjustmentModalProvider } from "@/features/stock-adjustment"
import { SupplierModalProvider } from "@/features/suppliers/supplier-modal-context"
import { UserModalProvider } from "@/features/users/user-modal-context"

// Add all new global providers to this array.
// The order matters if one provider depends on another.

const providers = [
  QueryProvider,
  GlobalModalProvider,
  AcceptanceModalProvider,
  AttributeModalProvider,
  BoxNumberModalProvider,
  BrandModalProvider,
  CategoryModalProvider,
  CustomerModalProvider,
  ExpenseModalProvider,
  ItemModalProvider,
  MasterSettingModalProvider,
  ModelModalProvider,
  PermissionModalProvider,
  StockAdjustmentModalProvider,
  SupplierModalProvider,
  UserModalProvider,
]

export function AppProviders({ children }: { children: React.ReactNode }) {
  return providers.reduceRight((acc, Provider) => {
    return <Provider>{acc}</Provider>
  }, <>{children}</>)
}