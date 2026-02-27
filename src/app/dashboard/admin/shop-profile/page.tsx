"use client"

import { ShopProfileManager } from "@/features/shop-profile"

export default function ShopProfilePage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="mb-4">
        <h1 className="text-3xl font-bold">Shop Profile</h1>
        <p className="text-muted-foreground">
          Manage your shop identity and business information.
        </p>
      </div>
      <ShopProfileManager />
    </div>
  )
}