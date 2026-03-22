"use client"

import * as React from "react"
import { Control, FieldValues, Path } from "react-hook-form"
import { Check, ChevronsUpDown, Plus, Loader2, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form"
import { FieldLabel } from "./field-label"

/**
 * Professional Generic Interface for Combobox.
 * TFieldValues links directly to the specific form schema (e.g. CustomerFormValues).
 */
interface SelectFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>
  name: Path<TFieldValues>
  label: string
  placeholder: string
  searchPlaceholder?: string
  noResultsMessage?: string
  options: { value: string; label: string }[]
  onAdd?: () => void
  required?: boolean
  isLoading?: boolean
  disabled?: boolean
  readOnly?: boolean
  className?: string
  isMulti?: boolean
}

export function SelectField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  searchPlaceholder = "Search options...",
  noResultsMessage = "No results found.",
  options,
  onAdd,
  required,
  isLoading = false,
  disabled = false,
  readOnly = false,
  className,
  isMulti = false,
}: SelectFieldProps<TFieldValues>) {
  const [open, setOpen] = React.useState(false)
  
  // Find selected label for display
  const getSelectedLabel = (value: string) => {
    return options.find((opt) => opt.value === value)?.label || ""
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSelect = (optionValue: string, field: any) => {
    if (isMulti) {
      const currentValues = Array.isArray(field.value) ? field.value : []
      const newValues = currentValues.includes(optionValue)
        ? currentValues.filter((v: string) => v !== optionValue)
        : [...currentValues, optionValue]
      field.onChange(newValues)
    } else {
      if (field.value === optionValue && !required) {
        field.onChange("")
      } else {
        field.onChange(optionValue)
      }
      setOpen(false)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleRemove = (optionValue: string, field: any, e: React.MouseEvent) => {
    e.stopPropagation()
    if (isMulti && Array.isArray(field.value)) {
      field.onChange(field.value.filter((v: string) => v !== optionValue))
    }
  }

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("min-w-0", className)}>
          <FieldLabel label={label} required={required} readOnly={readOnly} />

          {readOnly ? (
            <FormControl>
              <div className={cn(
                "min-h-[2.25rem] py-2 px-3 w-full rounded-md border border-input bg-muted/50 text-sm cursor-default",
                !field.value && "text-muted-foreground"
              )}>
                {isMulti && Array.isArray(field.value) && field.value.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {field.value.map((val: string) => (
                      <Badge key={val} variant="secondary" className="font-normal">
                        {getSelectedLabel(val) || val}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  field.value ? getSelectedLabel(field.value) : placeholder
                )}
              </div>
            </FormControl>
          ) : (
            <div className="flex items-center w-full">
              <Popover open={open} onOpenChange={setOpen} modal={true}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      disabled={isLoading || disabled}
                      className={cn(
                        "flex flex-1 justify-between min-h-[2.25rem] h-auto px-3 py-2 font-normal shadow-sm transition-all min-w-0",
                        onAdd && "rounded-r-none border-r-0",
                        (!field.value || (Array.isArray(field.value) && field.value.length === 0)) && "text-muted-foreground"
                      )}
                    >
                      <span className="flex-1 text-left w-0">
                        {isMulti && Array.isArray(field.value) && field.value.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {field.value.map((val: string) => (
                              <Badge key={val} variant="secondary" className="rounded-sm px-1 font-normal">
                                {getSelectedLabel(val)}
                                <span
                                  className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer hover:bg-muted p-0.5"
                                  onMouseDown={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                  }}
                                  onClick={(e) => handleRemove(val, field, e)}
                                >
                                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                </span>
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="truncate block">{field.value ? getSelectedLabel(field.value) : placeholder}</span>
                        )}
                      </span>
                  <div className="flex items-center shrink-0 ml-2">
                    {!isMulti && field.value && !required && (
                      <div
                        role="button"
                        className="mr-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer hover:bg-muted p-0.5"
                        onMouseDown={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          field.onChange("")
                        }}
                      >
                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                      </div>
                    )}
                    {isLoading ? (
                      <Loader2 className="h-3 w-3 animate-spin opacity-50" />
                    ) : (
                      <ChevronsUpDown className="h-3 w-3 opacity-50" />
                    )}
                  </div>
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent 
                  className="p-0 shadow-xl min-w-[200px]" 
                  align="start"
                  style={{ width: "var(--radix-popover-trigger-width)" }}
                >
                  <Command className="rounded-lg">
                    <CommandInput 
                      placeholder={searchPlaceholder} 
                      className="h-9 text-sm"
                    />
                    <CommandList className="max-h-[200px] overflow-y-auto">
                      <CommandEmpty className="py-4 text-center text-xs text-muted-foreground">
                        {noResultsMessage}
                      </CommandEmpty>
                      <CommandGroup>
                        {options.map((option) => (
                          <CommandItem
                            key={option.value}
                            value={option.label}
                            onSelect={() => handleSelect(option.value, field)}
                            className="flex items-center justify-between py-2 cursor-pointer text-sm"
                          >
                            <span className="truncate">{option.label}</span>
                            <Check
                              className={cn(
                                "h-4 w-4 text-primary",
                                isMulti 
                                  ? (Array.isArray(field.value) && field.value.includes(option.value) ? "opacity-100" : "opacity-0")
                                  : (field.value === option.value ? "opacity-100" : "opacity-0")
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {onAdd && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={isLoading || disabled}
                  className="h-9 w-9 rounded-l-none bg-muted/50 hover:bg-muted shadow-sm shrink-0"
                  onClick={(e) => {
                    e.preventDefault();
                    onAdd();
                  }}
                >
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </Button>
              )}
            </div>
          )}
          <FormMessage className="text-[10px] font-medium" />
        </FormItem>
      )}
    />
  )
}