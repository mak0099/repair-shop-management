"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AddUserPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add User</h1>
        <p className="text-muted-foreground">Create a new system user account</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>Enter details for the new user</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This page is under development. User creation form will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  )
}