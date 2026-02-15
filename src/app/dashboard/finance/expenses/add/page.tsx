"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AddGeneralExpensePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add General Expense</h1>
        <p className="text-muted-foreground">Record a new general expense</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Expense Form</CardTitle>
          <CardDescription>Add new general expense entry</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This page is under development. General expense form will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  )
}