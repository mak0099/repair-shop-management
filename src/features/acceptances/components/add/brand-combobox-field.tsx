"use client"

import { useState } from "react"
import { useFormContext, Control, FieldValues, Path } from "react-hook-form"

import { Modal } from "@/components/shared/modal"
import { ComboboxWithAdd } from "@/components/forms/combobox-with-add-field"
import { useBrands } from "@/features/brands/brand.api"
import { BrandForm } from "@/features/brands/components/brand-form"
import { Brand } from "@/features/brands/brand.schema"

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
  const { setValue } = useFormContext<TFieldValues>()
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false)

  const { data: brandsData, isLoading } = useBrands()
  const brands = brandsData?.data || []

  const brandOptions = brands.map((b) => ({
    value: b.id,
    label: b.name,
  }))

  const handleBrandSuccess = (newBrand: Brand) => {
    setIsBrandModalOpen(false)
    if (newBrand?.id) {
      setValue(name, newBrand.id as any, { shouldValidate: true })
    }
  }

  return (
    <>
      <Modal
        title="Add New Brand"
        description="Create a new device brand."
        isOpen={isBrandModalOpen}
        onClose={() => setIsBrandModalOpen(false)}
        className="max-w-lg"
      >
        <BrandForm onSuccess={handleBrandSuccess} />
      </Modal>

      <ComboboxWithAdd
        control={control}
        name={name}
        label={label}
        placeholder={placeholder}
        searchPlaceholder="Search brands..."
        noResultsMessage="No brand found."
        options={brandOptions}
        onAdd={() => setIsBrandModalOpen(true)}
        required={required}
        isLoading={isLoading}
      />
    </>
  )
}