"use client"

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
}

export function BrandComboboxField<TFieldValues extends FieldValues>({
  name,
  control,
  label = "Brand",
  placeholder = "Select Brand",
  required = false,
}: BrandComboboxFieldProps<TFieldValues>) {
  const { setValue, trigger } = useFormContext<TFieldValues>()
  const { openModal } = useBrandModal()
  const { data: brandOptionsData, isLoading } = useBrandOptions()
  const brands = brandOptionsData || []

  const brandOptions = brands.map((b) => ({
    value: b.id,
    label: b.name,
  }))

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
      />
    </>
  )
}