"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomeStockListPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Home Stock List</h1>
        <p className="text-muted-foreground">View home delivery stock levels</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Stock Inventory</CardTitle>
          <CardDescription>Home delivery stock levels</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This page is under development. Stock management will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  )
}