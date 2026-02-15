"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function UserManagementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Manage system users and permissions</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>System user accounts and roles</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This page is under development. User management will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  )
}