"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function BoxNumbersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Box Numbers</h1>
        <p className="text-muted-foreground">Manage box number assignments</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Box Management</CardTitle>
          <CardDescription>Track and assign box numbers</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This page is under development. Box number management will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  )
}