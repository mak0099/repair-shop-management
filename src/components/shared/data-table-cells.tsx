"use client"

import { useState } from "react"
import Image from "next/image"
import { CheckCircle, XCircle, ImageIcon } from "lucide-react"
import { format, isValid } from "date-fns"

import { cn } from "@/lib/utils"

// --- StatusCell ---
interface StatusCellProps {
  isActive: boolean | undefined | null
}

export function StatusCell({ isActive }: StatusCellProps) {
  return (
    <div className="flex items-center justify-center w-full">
      {isActive ? (
        <CheckCircle className="h-4 w-4 text-emerald-500" />
      ) : (
        <XCircle className="h-4 w-4 text-slate-300" />
      )}
    </div>
  )
}

// --- DateCell ---
interface DateCellProps {
  date: string | Date | undefined | null
  placeholder?: string
  includeTime?: boolean
  isActive?: boolean
}

export function DateCell({
  date,
  placeholder = "N/A",
  includeTime = false,
  isActive = true
}: DateCellProps) {
  if (!date) {
    return <span className="text-muted-foreground italic text-xs">{placeholder}</span>
  }

  const dateObj = typeof date === "string" ? new Date(date) : date

  if (!isValid(dateObj)) {
    return <span className="text-destructive text-xs">Invalid Date</span>
  }

  return (
    <span className={cn(
      "text-sm font-medium",
      isActive ? "text-foreground" : "text-muted-foreground"
    )}>
      {format(dateObj, includeTime ? "dd MMM yyyy, p" : "dd MMM yyyy")}
    </span>
  )
}

// --- ImageCell ---
interface ImageCellProps {
  src: string | null | undefined
  alt: string
  shape?: "circle" | "rounded" | "square"
  size?: number
  className?: string
}

/**
 * Main ImageCell component.
 * Uses a unique 'key' based on 'src' to automatically reset internal error states
 * without triggering cascading useEffect renders.
 */
export function ImageCell({
  src,
  alt,
  shape = "rounded",
  size = 40,
  className,
}: ImageCellProps) {
  const containerClasses = cn(
    "relative flex shrink-0 items-center justify-center overflow-hidden bg-slate-100 border border-slate-200 shadow-sm",
    {
      "rounded-full": shape === "circle",
      "rounded-md": shape === "rounded",
      "rounded-none": shape === "square",
    },
    className
  )

  const imageSizeStyle = {
    width: size,
    height: size,
  }

  return (
    <div className={containerClasses} style={imageSizeStyle}>
      {/* The 'key' prop here is the magic. When 'src' changes, React resets 
        the internal state of InternalImageContent entirely.
      */}
      <InternalImageContent
        key={src || "no-src"}
        src={src}
        alt={alt}
        size={size}
      />
    </div>
  )
}

/**
 * Internal helper to encapsulate error state.
 */
function InternalImageContent({
  src,
  alt,
  size
}: {
  src: string | null | undefined;
  alt: string;
  size: number
}) {
  const [hasError, setHasError] = useState(false)

  if (!src || hasError) {
    return <ImageIcon className="h-1/2 w-1/2 text-slate-300" />
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={`${size}px`}
      className="object-contain transition-transform duration-300 hover:scale-110"
      onError={() => setHasError(true)}
    />
  )
}

// --- TitleCell ---
interface TitleCellProps {
  value: string
  subtitle?: React.ReactNode
  isActive?: boolean
  onClick?: () => void
}

export function TitleCell({ value, subtitle, isActive = true, onClick }: TitleCellProps) {
  return (
    <div>
      <p
        className={cn(
          "font-medium cursor-pointer hover:underline",
          isActive ? "text-primary" : "text-muted-foreground"
        )}
        onClick={onClick}
      >{value}</p>
      {subtitle && (
        <div className="text-[10px] text-muted-foreground font-normal mt-0.5">{subtitle}</div>
      )}
    </div>
  )
}

// --- CurrencyCell ---
interface CurrencyCellProps {
  amount: number | string | undefined | null
  currencyCode?: string
  locale?: string
  className?: string
  subtitle?: React.ReactNode
}

export function CurrencyCell({
  amount,
  currencyCode = "EUR",
  locale = "it-IT",
  className,
  subtitle,
}: CurrencyCellProps) {
  const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount

  if (numericAmount === undefined || numericAmount === null || isNaN(numericAmount)) {
    return <div className={cn("text-right font-medium text-muted-foreground", className)}>-</div>
  }

  const formatted = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
  }).format(numericAmount)

  return (
    <div className={cn("text-right pr-4", className)}>
      <div className="font-medium">{formatted}</div>
      {subtitle && (
        <div className="text-[10px] text-muted-foreground font-normal mt-0.5">{subtitle}</div>
      )}
    </div>
  )
}