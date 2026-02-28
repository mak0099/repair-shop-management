"use client"

import { useMemo } from "react"
import { useFormContext, Control, FieldValues, Path, PathValue } from "react-hook-form"

import { SelectField } from "@/components/forms/select-field"
import { useItemOptions } from "../item.api"
import { useItemModal } from "../item-modal-context"

interface ItemSelectFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>
  control: Control<TFieldValues>
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
}

export function ItemSelectField<TFieldValues extends FieldValues>({
  name,
  control,
  label = "Item",
  placeholder = "Select Item",
  required = false,
  disabled = false,
  readOnly = false,
}: ItemSelectFieldProps<TFieldValues>) {
  const { setValue } = useFormContext<TFieldValues>()
  const { openModal } = useItemModal()
  const { data: itemOptionsData, isLoading } = useItemOptions()

  const itemOptions = useMemo(() => {
    const items = itemOptionsData || []
    return items.map((i) => ({
      value: i.id,
      label: i.name,
    }))
  }, [itemOptionsData])

  const handleAddItem = () => {
    openModal({
      onSuccess: (newItem) => {
        if (newItem?.id) {
          setValue(name, newItem.id as PathValue<TFieldValues, Path<TFieldValues>>)
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
        searchPlaceholder="Search items..."
        noResultsMessage="No item found."
        options={itemOptions}
        onAdd={handleAddItem}
        required={required}
        isLoading={isLoading}
        disabled={disabled}
        readOnly={readOnly}
      />
    </>
  )
}
