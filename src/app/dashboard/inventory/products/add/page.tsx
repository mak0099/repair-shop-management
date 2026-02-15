"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AddProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add Product</h1>
        <p className="text-muted-foreground">Add a new e-commerce product</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
          <CardDescription>Enter product details</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This page is under development. Product creation form will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  )
}