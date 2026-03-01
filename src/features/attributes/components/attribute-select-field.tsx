"use client"

import { useMemo } from "react"
import { Control, FieldValues, Path } from "react-hook-form"

import { SelectField } from "@/components/forms/select-field"
import { useAttributes } from "../attribute.api"
import { useAttributeModal } from "../attribute-modal-context"

interface AttributeSelectFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>
  control: Control<TFieldValues>
  /**
   * Unique identifier key to filter the correct attribute category (e.g., RAM, COLOR).
   */
  attributeKey: "RAM" | "ROM" | "COLOR" | "GRADE" | "WARRANTY" | "ACCESSORIES"
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
}

/**
 * A generic combobox field for system attributes that integrates with React Hook Form.
 * It uses the 'attributeKey' to filter specific data from the attributes list.
 */
export function AttributeSelectField<TFieldValues extends FieldValues>({
  name,
  control, 
  attributeKey,
  label,
  placeholder,
  required = false,
  disabled = false,
  readOnly = false,
}: AttributeSelectFieldProps<TFieldValues>) {
  const { openModal } = useAttributeModal()
  
  /**
   * Fetching attributes using the standardized hook.
   * allAttributes is expected to be of type PaginatedResponse<Attribute>.
   */
  const { data: allAttributes, isLoading } = useAttributes()

  /**
   * Derives the specific attribute data and maps its values into combobox options.
   * This logic is memoized to prevent unnecessary re-computations during re-renders.
   */
  const { attrData, options } = useMemo(() => {
    /**
     * Accessing the '.data' array from the paginated response to find the matching category.
     */
    const found = allAttributes?.data?.find(
      (attr) => attr.key === attributeKey
    )
    
    const mappedOptions = found?.values.map((val) => ({
      value: val.value,
      label: val.value,
    })) || []

    return { attrData: found, options: mappedOptions } 
  }, [allAttributes, attributeKey])

  const handleAddValue = () => {
    if (!attrData) return
    openModal({ 
      initialData: attrData,
      title: `Edit ${attrData.name}`
    })
  }

  return (
    <SelectField
      /**
       * By passing the generic TFieldValues types directly, we maintain 
       * full type safety without resorting to 'any'.
       */
      control={control}
      name={name}
      label={label || attrData?.name || attributeKey}
      placeholder={placeholder || `Select ${attrData?.name || attributeKey}`}
      searchPlaceholder={`Search ${attrData?.name || "options"}...`}
      noResultsMessage={`No ${attrData?.name || "options"} found.`}
      options={options}
      onAdd={handleAddValue}
      required={required}
      isLoading={isLoading}
      disabled={disabled || !attrData}
      readOnly={readOnly}
    />
  )
}