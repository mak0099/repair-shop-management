"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SubmitOrderPartsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div>
        <h1 className="text-3xl font-bold">Submit Order Parts</h1>
        <p className="text-muted-foreground">Order spare parts for repairs</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Parts Order Form</CardTitle>
          <CardDescription>Submit new parts order request</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This page is under development. Parts ordering functionality will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  )
}