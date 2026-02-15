"use client"

import { Control, FieldValues, Path } from "react-hook-form"

import { cn } from "@/lib/utils"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
} from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"

interface CheckboxFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>
  name: Path<TFieldValues>
  label: React.ReactNode
  description?: React.ReactNode
  disabled?: boolean
  className?: string
}

export function CheckboxField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  disabled = false,
  className,
}: CheckboxFieldProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem
          className={cn(
            "flex flex-row items-start space-x-3 space-y-0",
            className
          )}
        >
          <FormControl>
            <Checkbox
              disabled={disabled}
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel className={cn(!disabled && "cursor-pointer")}>
              {label}
            </FormLabel>
            {description && <FormDescription>{description}</FormDescription>}
          </div>
        </FormItem>
      )}
    />
  )
}