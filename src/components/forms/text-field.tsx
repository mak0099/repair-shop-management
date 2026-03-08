"use client"

import * as React from "react"
import { Control, FieldValues, Path } from "react-hook-form"

import { cn } from "@/lib/utils"
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { FieldLabel } from "./field-label"

interface TextFieldProps<TFieldValues extends FieldValues>
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "name"> {
  control: Control<TFieldValues>
  name: Path<TFieldValues>
  label?: string
  required?: boolean
  readOnly?: boolean
  labelClassName?: string
  inputClassName?: string
  icon?: React.ReactNode
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
  icon,
  ...props
}: TextFieldProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FieldLabel 
            label={label} 
            required={required} 
            readOnly={readOnly} 
            className={labelClassName} 
          />
          <div className="relative">
            {icon && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                {icon}
              </div>
            )}
            <FormControl>
              <Input
                type={type}
                readOnly={readOnly}
                tabIndex={readOnly ? -1 : 0}
                placeholder={readOnly ? "" : placeholder}
                className={cn(
                  readOnly && "cursor-default bg-muted/30 focus-visible:ring-0",
                  icon && "pl-10",
                  inputClassName
                )}
                {...props}
                {...field}
                onChange={(e) => {
                  field.onChange(e)
                  props.onChange?.(e)
                }}
                value={field.value ?? ""}
              />
            </FormControl>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}