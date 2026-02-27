"use client"

import { SaleReportManager } from "@/features/sale-report"

export default function SaleReportPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Sales Report</h1>
        <p className="text-sm text-muted-foreground">
          View and filter your sales data within a specific date range.
        </p>
      </div>
      <SaleReportManager />
    </div>
  )
}