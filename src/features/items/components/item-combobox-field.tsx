"use client"

import { useFormContext, Control, FieldValues, Path, PathValue } from "react-hook-form"

import { ComboboxWithAdd } from "@/components/forms/combobox-with-add-field"
import { useItemOptions } from "../item.api"
import { useItemModal } from "../item-modal-context"

interface ItemComboboxFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>
  control: Control<TFieldValues>
  label?: string
  placeholder?: string
  required?: boolean
}

export function ItemComboboxField<TFieldValues extends FieldValues>({
  name,
  control,
  label = "Item",
  placeholder = "Select Item",
  required = false,
}: ItemComboboxFieldProps<TFieldValues>) {
  const { setValue } = useFormContext<TFieldValues>()
  const { openModal } = useItemModal()
  const { data: itemOptionsData, isLoading } = useItemOptions()
  const items = itemOptionsData || []

  const itemOptions = items.map((i) => ({
    value: i.id,
    label: i.name,
  }))

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
      <ComboboxWithAdd
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
      />
    </>
  )
}
