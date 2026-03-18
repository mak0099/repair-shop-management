"use client"

import { useLoading } from "./loading-context"
import { cn } from "@/lib/utils"

export function LoadingBar() {
  const { isLoading } = useLoading()

  return (
    <>
      <div
        className={cn(
          "fixed top-0 left-0 w-full h-1 z-[9999] transition-opacity duration-300 pointer-events-none",
          "overflow-x-clip overflow-y-visible bg-primary/20",
          isLoading ? "opacity-100" : "opacity-0"
        )}
        role="progressbar"
        aria-busy={isLoading}
      >
        <div 
          className="h-full bg-primary relative"
          style={{ 
            width: '100%',
            backgroundImage: 'var(--primary-gradient)',
            boxShadow: 'var(--button-glow)',
            animation: 'loading-bar-progress 1.5s infinite linear',
            transformOrigin: 'left'
          }}
        >
          {/* ইউনিভার্সাল কনট্রাস্ট গ্লো (যাতে কালো বারের উপর সাদা শ্যাডো তৈরি হয়) */}
          <div 
            className="absolute inset-0"
            style={{ boxShadow: '0 0 12px 1px color-mix(in srgb, var(--primary-foreground), transparent 20%)' }}
          />
          {/* লেজার হেড (বার-এর সামনের অংশে একটি উজ্জ্বল হাইলাইট) */}
          <div 
            className="absolute top-0 right-0 h-full w-24 opacity-60"
            style={{ background: 'linear-gradient(to right, transparent, var(--primary-foreground))' }}
          />
        </div>
      </div>
      <style>{`
        @keyframes loading-bar-progress {
          0% { transform: translateX(-100%) scaleX(0.2); }
          50% { transform: translateX(0%) scaleX(0.5); }
          100% { transform: translateX(100%) scaleX(1); }
        }
      `}</style>
    </>
  )
}
