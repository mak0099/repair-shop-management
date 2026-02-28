"use client"

import { useMemo } from "react"
import { useFormContext, Control, FieldValues, Path, PathValue } from "react-hook-form"

import { SelectField } from "@/components/forms/select-field"
import { useSupplierOptions } from "../supplier.api"
import { useSupplierModal } from "../supplier-modal-context"

interface SupplierSelectFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>
  control: Control<TFieldValues>
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
}

export function SupplierSelectField<TFieldValues extends FieldValues>({
  name,
  control,
  label = "Supplier",
  placeholder = "Select Supplier",
  required = false,
  disabled = false,
  readOnly = false,
}: SupplierSelectFieldProps<TFieldValues>) {
  const { setValue } = useFormContext<TFieldValues>()
  const { openModal } = useSupplierModal()
  const { data: supplierOptionsData, isLoading } = useSupplierOptions()

  const supplierOptions = useMemo(() => {
    const suppliers = supplierOptionsData || []
    return suppliers.map((s) => ({
      value: s.id,
      label: s.company_name,
    }))
  }, [supplierOptionsData])

  const handleAddSupplier = () => {
    openModal({
      onSuccess: (newSupplier) => {
        if (newSupplier?.id) {
          setValue(name, newSupplier.id as PathValue<TFieldValues, Path<TFieldValues>>)
        }
      },
    })
  }

  return (
    <>
      <SelectField
        control={control}
        name={name}
        label={label}
        placeholder={placeholder}
        searchPlaceholder="Search suppliers..."
        noResultsMessage="No supplier found."
        options={supplierOptions}
        onAdd={handleAddSupplier}
        required={required}
        isLoading={isLoading}
        disabled={disabled}
        readOnly={readOnly}
      />
    </>
  )
}
