"use client"

import Image from "next/image"
import { useShopProfile } from "@/features/shop-profile/shop-profile.api"

export function BrandLogo() {
  const { data: shopProfile } = useShopProfile()

  return (
    <>
      <div className="relative flex aspect-square size-12 items-center justify-center rounded-lg overflow-hidden">
        <Image 
          src={shopProfile?.logoUrl || "/images/logo.png"} 
          alt="Logo" 
          fill
          className="object-contain p-0.5" 
          unoptimized 
          priority
        />
      </div>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-semibold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          {shopProfile?.name || "TELEFIX"}
        </span>
        <span className="truncate text-[0.65rem] text-muted-foreground">{shopProfile?.slogan || "Professional Edition"}</span>
      </div>
    </>
  )
}