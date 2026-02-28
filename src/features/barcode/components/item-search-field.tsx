"use client"

import { Control } from "react-hook-form"
import { ItemSelectField } from "@/features/items/components/item-select-field"

interface ItemSearchFieldProps {
  control: Control<any>
  name: string
  label?: string
}

export function ItemSearchField({ control, name, label = "Search Product to Print" }: ItemSearchFieldProps) {
  return (
    <ItemSelectField
      control={control}
      name={name}
      label={label}
      placeholder="Type product name or SKU..."
    />
  )
}