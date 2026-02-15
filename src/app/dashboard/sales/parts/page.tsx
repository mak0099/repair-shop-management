"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ListOfOrderPartsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">List of Order Parts</h1>
        <p className="text-muted-foreground">View all parts orders</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Parts Orders</CardTitle>
          <CardDescription>List of all parts order requests</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This page is under development. Parts orders list will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  )
}