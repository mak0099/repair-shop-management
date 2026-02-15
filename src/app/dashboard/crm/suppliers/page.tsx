"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SuppliersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Suppliers</h1>
        <p className="text-muted-foreground">Manage supplier database</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Supplier List</CardTitle>
          <CardDescription>All registered suppliers</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This page is under development. Supplier management will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  )
}