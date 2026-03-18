"use client"

import Image from "next/image"
import { useShopProfile } from "@/features/shop-profile/shop-profile.api"

export function BrandLogo() {
  const { data: shopProfile } = useShopProfile()

  return (
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
          className="truncate text-base font-extrabold tracking-tight"
          style={{ 
            /* ১. প্রথম লেয়ার: ভেরিয়েবল গ্রেডিয়েন্ট। 
               ২. দ্বিতীয় লেয়ার: সলিড কালার (currentColor) যা গ্রেডিয়েন্ট না থাকলে কাজ করবে।
               নোট: background-image এ প্রথম লেয়ারটি সবার উপরে থাকে।
            */
            backgroundImage: 'var(--primary-gradient), linear-gradient(currentColor, currentColor)',
            WebkitBackgroundClip: 'text',
            
            /* color: transparent এর বদলে WebkitTextFillColor ব্যবহার করছি। 
               এটিcurrentColor কে সচল রাখে কিন্তু টেক্সটকে স্বচ্ছ করে।
            */
            WebkitTextFillColor: 'transparent',
            color: 'inherit' 
          }}
        >
          {shopProfile?.name || "Telefix Mobile"}
        </span>
        
        <span className="text-[10px] font-medium text-inherit opacity-60 whitespace-normal break-words max-w-[160px] leading-tight mt-0.5">
          {shopProfile?.slogan || "Professional Inventory System"}
        </span>
      </div>
    </div>
  )
}