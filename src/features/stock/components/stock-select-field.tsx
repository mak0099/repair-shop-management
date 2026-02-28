"use client"

import { useMemo } from "react"
import { FieldValues, Control, Path } from "react-hook-form"
import { Smartphone } from "lucide-react"

import { SelectField } from "@/components/forms/select-field"
import { useStockOptions } from "../stock.api"

interface StockSelectFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>
  control: Control<TFieldValues>
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
}

export function StockSelectField<TFieldValues extends FieldValues>({
  name,
  control,
  label = "Select Unit (IMEI)",
  placeholder = "Search by IMEI or Model...",
  required = false,
  disabled = false,
  readOnly = false,
}: StockSelectFieldProps<TFieldValues>) {
  // Fetching stock options (Items that are currently in inventory)
  const { data: stockOptionsData, isLoading } = useStockOptions()

  const stockOptions = useMemo(() => {
    const stocks = stockOptionsData || []
    return stocks.map((s) => ({
      value: s.id,
      // Displaying Name + IMEI to make it easy for the user to identify the exact unit
      label: `${s.itemName} ${s.imei ? `— [IMEI: ${s.imei}]` : ""}`,
    }))
  }, [stockOptionsData])

  return (
    <div className="relative">
      <SelectField
        control={control}
        name={name}
        label={label}
        placeholder={placeholder}
        searchPlaceholder="Type IMEI or product name..."
        noResultsMessage="No matching unit found in stock."
        options={stockOptions}
        onAdd={undefined} 
        required={required}
        isLoading={isLoading}
        disabled={disabled}
        readOnly={readOnly}
      />
    </div>
  )
}