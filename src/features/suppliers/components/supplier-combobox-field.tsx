"use client"

import { useMemo } from "react"
import { useFormContext, Control, FieldValues, Path, PathValue } from "react-hook-form"

import { ComboboxWithAdd } from "@/components/forms/combobox-with-add-field"
import { useSupplierOptions } from "../supplier.api"
import { useSupplierModal } from "../supplier-modal-context"

interface SupplierComboboxFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>
  control: Control<TFieldValues>
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
}

export function SupplierComboboxField<TFieldValues extends FieldValues>({
  name,
  control,
  label = "Supplier",
  placeholder = "Select Supplier",
  required = false,
  disabled = false,
}: SupplierComboboxFieldProps<TFieldValues>) {
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
      <ComboboxWithAdd
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
      />
    </>
  )
}
