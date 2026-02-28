"use client"

import * as React from "react"
import { Control, FieldValues, Path, useController } from "react-hook-form"
import { Check, ChevronsUpDown, Plus, Loader2, Search } from "lucide-react"

import { cn } from "@/lib/utils"
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
import { Input } from "@/components/ui/input"
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
}: SelectFieldProps<TFieldValues>) {
  const [open, setOpen] = React.useState(false)
  
  // Find selected label for display
  const getSelectedLabel = (value: string) => {
    return options.find((opt) => opt.value === value)?.label || ""
  }

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("space-y-1.5", className)}>
          <FieldLabel label={label} required={required} readOnly={readOnly} />

          {readOnly ? (
            <FormControl>
              <Input
                readOnly
                value={getSelectedLabel(field.value)}
                className="h-9 bg-slate-50/50 border-slate-200 cursor-default focus-visible:ring-0"
              />
            </FormControl>
          ) : (
            <div className="flex items-center">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      disabled={isLoading || disabled}
                      className={cn(
                        "flex-1 justify-between h-9 px-3 font-normal border-slate-200 shadow-sm transition-all hover:bg-slate-50",
                        onAdd && "rounded-r-none border-r-0",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <span className="truncate">
                        {field.value ? getSelectedLabel(field.value) : placeholder}
                      </span>
                      {isLoading ? (
                        <Loader2 className="h-3 w-3 animate-spin opacity-50" />
                      ) : (
                        <ChevronsUpDown className="h-3 w-3 opacity-50" />
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent 
                  className="p-0 border-slate-200 shadow-xl" 
                  align="start"
                  style={{ width: "var(--radix-popover-trigger-width)" }}
                >
                  <Command className="rounded-lg">
                    <CommandInput 
                      placeholder={searchPlaceholder} 
                      className="h-9 text-sm"
                    />
                    <CommandList className="max-h-[200px] overflow-y-auto">
                      <CommandEmpty className="py-4 text-center text-xs text-slate-500">
                        {noResultsMessage}
                      </CommandEmpty>
                      <CommandGroup>
                        {options.map((option) => (
                          <CommandItem
                            key={option.value}
                            value={option.label}
                            onSelect={() => {
                              field.onChange(option.value)
                              setOpen(false)
                            }}
                            className="flex items-center justify-between py-2 cursor-pointer text-sm"
                          >
                            <span className="truncate">{option.label}</span>
                            <Check
                              className={cn(
                                "h-4 w-4 text-primary",
                                field.value === option.value ? "opacity-100" : "opacity-0"
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
                  className="h-9 w-9 rounded-l-none border-slate-200 bg-slate-50 hover:bg-slate-100 shadow-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    onAdd();
                  }}
                >
                  <Plus className="h-4 w-4 text-slate-600" />
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