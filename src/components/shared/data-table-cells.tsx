"use client"

import { useState } from "react"
import Image from "next/image"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface StatusCellProps {
  isActive: boolean | undefined | null
}

export function StatusCell({ isActive }: StatusCellProps) {
  if (isActive === null || typeof isActive === "undefined") {
    return <Badge variant="secondary">Unknown</Badge>
  }
  return (
    <Badge variant={isActive ? "default" : "destructive"}>{isActive ? "Active" : "Inactive"}</Badge>
  )
}

interface DateCellProps {
  date: string | Date | undefined | null
  placeholder?: string
}

export function DateCell({ date, placeholder = "N/A" }: DateCellProps) {
  if (!date) {
    return <span className="text-muted-foreground">{placeholder}</span>
  }
  try {
    return <span>{new Date(date).toLocaleDateString()}</span>
  } catch (error) {
    return <span className="text-destructive">Invalid Date</span>
  }
}

interface ImageCellProps {
  src: string | null | undefined
  alt: string
  shape?: "circle" | "rounded" | "square"
  size?: number // Corresponds to h-`size` w-`size` in Tailwind
  fallbackText?: React.ReactNode
  className?: string
}

export function ImageCell({
  src,
  alt,
  shape = "rounded",
  size = 10,
  fallbackText = (
    <>
      No
      <br />
      Image
    </>
  ),
  className,
}: ImageCellProps) {
  const [error, setError] = useState(false)

  const containerClasses = cn(
    "relative flex items-center justify-center text-center text-xs text-gray-400 bg-gray-100",
    `h-${size} w-${size}`,
    {
      "rounded-full": shape === "circle",
      "rounded-md": shape === "rounded",
      "rounded-none": shape === "square",
    },
    className
  )

  if (!src || error) {
    return <div className={containerClasses}>{fallbackText}</div>
  }

  return (
    <div className={containerClasses}>
      <Image src={src} alt={alt} fill className={cn("object-contain", { "rounded-full": shape === "circle", "rounded-md": shape === "rounded" })} onError={() => setError(true)} />
    </div>
  )
}