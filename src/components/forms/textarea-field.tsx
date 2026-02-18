"use client"

import { Control, FieldValues, Path } from "react-hook-form"

import { cn } from "@/lib/utils"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea, TextareaProps } from "@/components/ui/textarea"

interface TextareaFieldProps<TFieldValues extends FieldValues>
  extends Omit<TextareaProps, "name"> {
  control: Control<TFieldValues>
  name: Path<TFieldValues>
  label: string
  required?: boolean
  readOnly?: boolean
  labelClassName?: string
}

export function TextareaField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  required = false,
  readOnly = false,
  placeholder,
  className,
  labelClassName,
  ...props
}: TextareaFieldProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel className={cn("text-xs", labelClassName, required && !readOnly && "required")}>
            {label}
          </FormLabel>
          <FormControl>
            <Textarea
              readOnly={readOnly}
              tabIndex={readOnly ? -1 : 0}
              placeholder={readOnly ? "" : placeholder}
              className={cn(
                readOnly && "cursor-default bg-muted/30 focus-visible:ring-0"
              )}
              {...props}
              {...field}
              value={field.value ?? ""}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}