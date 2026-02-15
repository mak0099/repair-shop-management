"use client"

import * as React from "react"
import { Control, FieldValues, Path } from "react-hook-form"

import { Check, ChevronsUpDown, Plus, Loader2 } from "lucide-react"
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
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"

interface ComboboxWithAddProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>
  name: Path<TFieldValues>
  label: string
  placeholder: string
  searchPlaceholder: string
  noResultsMessage?: string
  options: { value: string; label: string }[]
  onAdd?: () => void
  required?: boolean
  isLoading?: boolean
  disabled?: boolean
}

export function ComboboxWithAdd<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  searchPlaceholder,
  noResultsMessage = "No results found.",
  options,
  onAdd,
  required,
  isLoading = false,
  disabled = false,
}: ComboboxWithAddProps<TFieldValues>) {
  const [open, setOpen] = React.useState(false)

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className={cn("text-xs", required && !disabled && "required")}>
            {label} {required && !disabled && <span className="text-red-500">*</span>}
          </FormLabel>
          <div className="flex items-end">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    disabled={isLoading || disabled}
                    role="combobox"
                    className={cn(
                      "flex-1 justify-between",
                      onAdd && "rounded-r-none",
                      !field.value && "text-muted-foreground",
                      disabled && "cursor-default bg-muted/30 opacity-100 hover:bg-muted/30"
                    )}
                  >
                    {field.value
                      ? options.find((option) => option.value === field.value)?.label
                      : (disabled ? "" : placeholder)}
                    {isLoading
                      ? (<Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin" />)
                      : !disabled && (
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        )}
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="p-0" style={{ width: "var(--radix-popover-trigger-width)" }} align="start">
                <Command>
                  <CommandInput placeholder={searchPlaceholder} />
                  <CommandList>
                    {isLoading ? (
                      <div className="p-2 flex justify-center items-center">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    ) : (
                      <>
                        <CommandEmpty>{noResultsMessage}</CommandEmpty>
                        <CommandGroup>
                          {options.map((option) => (
                            <CommandItem
                              value={option.label}
                              key={option.value}
                              onSelect={() => {
                                field.onChange(option.value)
                                setOpen(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  option.value === field.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {option.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {onAdd && !disabled && <Button 
              type="button" 
              variant="outline" 
              size="icon" 
              className="rounded-l-none border-l-0"
              onClick={onAdd}
            >
              <Plus className="h-4 w-4" />
            </Button>}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
