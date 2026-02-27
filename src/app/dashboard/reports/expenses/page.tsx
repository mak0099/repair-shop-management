"use client"

import { ExpenseReportManager } from "@/features/expense-report"

export default function ExpenseReportPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Expense Report</h1>
        <p className="text-sm text-muted-foreground">
          View and filter your business expenses within a date range.
        </p>
      </div>
      <ExpenseReportManager />
    </div>
  )
}