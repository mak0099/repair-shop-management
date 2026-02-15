"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AddSupplierPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add Supplier</h1>
        <p className="text-muted-foreground">Register a new supplier</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Supplier Information</CardTitle>
          <CardDescription>Enter supplier details</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This page is under development. Supplier registration form will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  )
}