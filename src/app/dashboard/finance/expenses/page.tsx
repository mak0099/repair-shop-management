"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function GeneralExpensesSearchPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">General Expenses Search</h1>
        <p className="text-muted-foreground">Search and view general expense records</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Expense Records</CardTitle>
          <CardDescription>Search through general expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This page is under development. General expenses search will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  )
}