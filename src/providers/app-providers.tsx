"use client"

import React from "react"
import { SessionProvider } from "next-auth/react"
import { GlobalModalProvider } from "@/components/shared/global-modal-context"
import QueryProvider from "./query-provider"
import { MSWProvider } from "@/providers/msw-provider"
import { AcceptanceModalProvider } from "@/features/acceptances/acceptance-modal-context"
import { TicketWorkspaceModalProvider } from "@/features/acceptances/ticket-workspace-modal-context"
import { AttributeModalProvider } from "@/features/attributes/attribute-modal-context"
import { BoxNumberModalProvider } from "@/features/box-numbers/box-number-modal-context"
import { BrandModalProvider } from "@/features/brands/brand-modal-context"
import { CategoryModalProvider } from "@/features/categories/category-modal-context"
import { CustomerModalProvider } from "@/features/customers/customer-modal-context"
import { ExpenseModalProvider } from "@/features/expenses/expense-modal-context"
import { ItemModalProvider } from "@/features/items/item-modal-context"
import { MasterSettingModalProvider } from "@/features/master-settings/master-setting-modal-context"
import { ModelModalProvider } from "@/features/models/model-modal-context"
import { PermissionModalProvider } from "@/features/permissions/permission-modal-context"
import { StockAdjustmentModalProvider } from "@/features/stock-adjustment/stock-adjustment-modal-context"
import { SupplierModalProvider } from "@/features/suppliers/supplier-modal-context"
import { UserModalProvider } from "@/features/users/user-modal-context"
import { RoleModalProvider } from "@/features/roles/role-modal-context"
import { SalesModalProvider } from "@/features/sales/sales-modal-context"
import { QuotationModalProvider } from "@/features/quotations/quotation-modal-context"
import { ReturnModalProvider } from "@/features/returns/return-modal-context"
import { RegisterModalProvider } from "@/features/register/register-modal-context"
import { PurchaseModalProvider } from "@/features/purchases/purchase-modal-context"
import { KhataModalProvider } from "@/features/khata/khata-modal-context"
import { LoadingProvider } from "@/components/shared/loading-context"
import { ThemeProvider } from "./theme-provider"
import { CurrencyProvider } from "./currency-provider"

// Add all new global providers to this array.
// The order matters if one provider depends on another.

const providers = [
  LoadingProvider,
  MSWProvider,
  SessionProvider,
  QueryProvider,
  ThemeProvider,
  CurrencyProvider,
  GlobalModalProvider,
  AcceptanceModalProvider,
  TicketWorkspaceModalProvider,
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
  RoleModalProvider,
  SalesModalProvider,
  QuotationModalProvider,
  ReturnModalProvider,
  RegisterModalProvider,
  PurchaseModalProvider,
  KhataModalProvider,
]

export function AppProviders({ children }: { children: React.ReactNode }) {
  return providers.reduceRight((acc, Provider) => {
    return <Provider>{acc}</Provider>
  }, <>{children}</>)
}