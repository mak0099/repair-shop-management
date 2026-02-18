"use client"

import { useMemo } from "react"
import { useFormContext, Control, FieldValues, Path, PathValue } from "react-hook-form"

import { ComboboxWithAdd } from "@/components/forms/combobox-with-add-field";
import { useBrandOptions } from "../brand.api";
import { useBrandModal } from "../brand-modal-context";

interface BrandComboboxFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>
  control: Control<TFieldValues>
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
}

export function BrandComboboxField<TFieldValues extends FieldValues>({
  name,
  control,
  label = "Brand",
  placeholder = "Select Brand",
  required = false,
  disabled = false,
}: BrandComboboxFieldProps<TFieldValues>) {
  const { setValue, trigger } = useFormContext<TFieldValues>()
  const { openModal } = useBrandModal()
  const { data: brandOptionsData, isLoading } = useBrandOptions()

  const brandOptions = useMemo(() => {
    const brands = brandOptionsData || []
    return brands.map((b) => ({
      value: b.id,
      label: b.name,
    }))
  }, [brandOptionsData])

  const handleAddBrand = () => {
    openModal({
      onSuccess: (newBrand) => {
        if (newBrand?.id) {
          setValue(name, newBrand.id as PathValue<TFieldValues, Path<TFieldValues>>)
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
        searchPlaceholder="Search brands..."
        noResultsMessage="No brand found."
        options={brandOptions}
        onAdd={handleAddBrand}
        required={required}
        isLoading={isLoading}
        disabled={disabled}
      />
    </>
  )
}