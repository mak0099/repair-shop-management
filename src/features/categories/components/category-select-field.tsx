"use client"

import { useMemo } from "react"
import { useFormContext, Control, FieldValues, Path, PathValue } from "react-hook-form"

import { SelectField } from "@/components/forms/select-field"
import { useCategoryOptions } from "../category.api"
import { useCategoryModal } from "../category-modal-context"

interface CategorySelectFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>
  control: Control<TFieldValues>
  label?: string
  placeholder?: string
  required?: boolean
  parentId?: string
  disabled?: boolean
  readOnly?: boolean
}

export function CategorySelectField<TFieldValues extends FieldValues>({
  name,
  control,
  label = "Category",
  placeholder = "Select Category",
  required = false,
  parentId,
  disabled = false,
  readOnly = false,
}: CategorySelectFieldProps<TFieldValues>) {
  const { setValue } = useFormContext<TFieldValues>()
  const { openModal } = useCategoryModal()
  const { data: categoryOptionsData, isLoading } = useCategoryOptions(parentId)

  const categoryOptions = useMemo(() => {
    const categories = categoryOptionsData || []
    return categories.map((c) => ({
      value: c.id,
      label: c.name,
    }))
  }, [categoryOptionsData])

  const handleAddCategory = () => {
    openModal({
      onSuccess: (newCategory) => {
        if (newCategory?.id) {
          setValue(name, newCategory.id as PathValue<TFieldValues, Path<TFieldValues>>)
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
        searchPlaceholder="Search categories..."
        noResultsMessage="No category found."
        options={categoryOptions}
        onAdd={handleAddCategory}
        required={required}
        isLoading={isLoading}
        disabled={disabled}
        readOnly={readOnly}
      />
    </>
  )
}
