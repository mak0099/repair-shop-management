"use client"

import Image from "next/image"
import { useShopProfile } from "@/features/shop-profile/shop-profile.api"

export function BrandLogo() {
  const { data: shopProfile } = useShopProfile()

  return (
    <>
      <style>{`
        @keyframes animateGradient {
          0% {
            background-position: 0% center;
          }
          50% {
            background-position: 100% center;
          }
          100% {
            background-position: 0% center;
          }
        }
      `}</style>
      <div className="flex items-center gap-3 py-1 transition-all duration-300 group-hover:translate-x-1 group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:group-hover:translate-x-0">
        {/* লোগো কন্টেইনার */}
        <div className="relative flex aspect-square size-10 shrink-0 items-center justify-center rounded-xl overflow-hidden bg-white shadow-sm border border-black/5 transition-transform group-hover:scale-105">
          <Image
            src={shopProfile?.logoUrl || "/images/logo.png"}
            alt={shopProfile?.name || "Logo"}
            fill
            className="object-contain p-1.5"
            unoptimized
            priority
          />
        </div>

        {/* ব্র্যান্ড নেম এবং স্লোগান */}
        <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
          <span
            className="block truncate text-lg font-extrabold tracking-tight rounded-md"
            style={{
              backgroundImage: 'var(--primary-gradient), linear-gradient(currentColor, currentColor)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'inherit',
              animation: 'animateGradient 10s linear infinite',
              backgroundColor: 'var(--card)'
            }}
          >
            {shopProfile?.name || "Telefix IT"}
          </span>

          <span className="text-[10px] font-medium text-inherit opacity-60 whitespace-normal break-words max-w-[160px] leading-tight">
            {shopProfile?.slogan || "Professional Inventory System"}
          </span>
        </div>
      </div>
    </>
  )
}