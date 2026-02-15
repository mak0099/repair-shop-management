"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AddTrackingDevicePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add Tracking Device</h1>
        <p className="text-muted-foreground">Register a new tracking device</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Device Information</CardTitle>
          <CardDescription>Enter tracking device details</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This page is under development. Tracking device registration will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  )
}