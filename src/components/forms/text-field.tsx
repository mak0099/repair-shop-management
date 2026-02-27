"use client"

import * as React from "react"
import { Control, FieldValues, Path } from "react-hook-form"

import { cn } from "@/lib/utils"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

interface TextFieldProps<TFieldValues extends FieldValues>
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "name"> {
  control: Control<TFieldValues>
  name: Path<TFieldValues>
  label: string
  required?: boolean
  readOnly?: boolean
  labelClassName?: string
  inputClassName?: string
}

export function TextField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  required = false,
  readOnly = false,
  placeholder,
  type,
  className,
  labelClassName,
  inputClassName,
  ...props
}: TextFieldProps<TFieldValues>) {
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
            <Input
              type={type}
              readOnly={readOnly}
              tabIndex={readOnly ? -1 : 0}
              placeholder={readOnly ? "" : placeholder}
              className={cn(
                readOnly && "cursor-default bg-muted/30 focus-visible:ring-0",
                inputClassName
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