"use client"

import { useMemo } from "react"
import { useFormContext, Control, FieldValues, Path } from "react-hook-form"

import { ComboboxWithAdd } from "@/components/forms/combobox-with-add-field"
import { useAttributes } from "../attribute.api"
import { useAttributeModal } from "../attribute-modal-context"
import { AttributeForm } from "./attribute-form"

interface AttributeComboboxFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>
  control: Control<TFieldValues>
  // Identifier key from our systemAttributes list (e.g., "RAM", "COLOR")
  attributeKey: "RAM" | "ROM" | "COLOR" | "GRADE" | "WARRANTY" | "ACCESSORIES" // Updated type
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
}

export function AttributeComboboxField<TFieldValues extends FieldValues>({
  name,
  control, 
  attributeKey, // Renamed from attributeName
  label,
  placeholder,
  required = false,
  disabled = false,
  readOnly = false,
}: AttributeComboboxFieldProps<TFieldValues>) {
  const { closeModal, openModal } = useAttributeModal()
  
  // Fetch all attributes from the API
  const { data: allAttributes, isLoading } = useAttributes()

  // Filter data by the unique KEY and map values to combobox options
  const { attrData, options } = useMemo(() => {
    const found = allAttributes?.find(
      (a) => a.key === attributeKey // Changed lookup to use 'key'
    )
    
    const mappedOptions = found?.values.map((v) => ({
      value: v.value, // We store the string value directly (e.g., "8GB")
      label: v.value,
    })) || []

    return { attrData: found, options: mappedOptions } 
  }, [allAttributes, attributeKey])

  const handleAddValue = () => {
    if (!attrData) return

    // Opens the attribute management modal for the specific category
    openModal({ initialData: attrData }) // Pass attrData directly
  }

  return (
    <ComboboxWithAdd
      control={control}
      name={name}
      label={label || attrData?.name || attributeKey} // Use attrData.name for label, fallback to attributeKey
      placeholder={placeholder || `Select ${attrData?.name || attributeKey}`} // Use attrData.name for placeholder, fallback to attributeKey
      searchPlaceholder={`Search ${attrData?.name || "options"}...`} // Use attrData.name for search placeholder
      noResultsMessage={`No ${attrData?.name || "options"} found.`} // Use attrData.name for no results message
      options={options}
      onAdd={handleAddValue}
      required={required}
      isLoading={isLoading}
      disabled={disabled || !attrData}
      readOnly={readOnly}
    />
  )
}