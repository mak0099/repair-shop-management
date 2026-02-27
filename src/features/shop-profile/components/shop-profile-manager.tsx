"use client"

import { useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { useShopProfile } from "../shop-profile.api"
import { ShopProfileView } from "./shop-profile-view"
import { ShopProfileForm } from "./shop-profile-form"

export function ShopProfileManager() {
  const [isEditing, setIsEditing] = useState(false)
  const { data: profile, isLoading, isSuccess } = useShopProfile()

  const handleEdit = () => setIsEditing(true)
  const handleCancel = () => {
    // If there's no profile, we can't cancel out of edit mode
    if (profile) {
      setIsEditing(false)
    }
  }
  const handleSuccess = () => setIsEditing(false)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-48 md:col-span-1" />
          <Skeleton className="h-48 md:col-span-2" />
        </div>
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  // If loading is finished, there's no profile, and we are not in edit mode,
  // force the view into edit mode to allow profile creation.
  if (isSuccess && !profile && !isEditing) {
    setIsEditing(true)
  }

  if (isEditing) {
    return <ShopProfileForm initialData={profile} onSuccess={handleSuccess} onCancel={handleCancel} />
  }

  return <ShopProfileView onEdit={handleEdit} />
}