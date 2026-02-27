"use client"

import { InvoiceSetupManager } from "@/features/invoice-setup"

export default function InvoiceSetupPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Invoice Configuration</h1>
        <p className="text-sm text-muted-foreground">
          Customize your invoice templates, terms, and branding.
        </p>
      </div>
      
      <InvoiceSetupManager />
    </div>
  )
}