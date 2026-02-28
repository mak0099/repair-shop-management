"use client"

import { cn } from "@/lib/utils"
import { FormLabel } from "@/components/ui/form"

interface FieldLabelProps {
  label: React.ReactNode
  required?: boolean
  readOnly?: boolean
  className?: string
}

export function FieldLabel({ label, required, readOnly, className }: FieldLabelProps) {
  return (
    <FormLabel
      className={cn(
        "text-xs",
        required && !readOnly && "required",
        className
      )}
    >
      {label}
    </FormLabel>
  )
}