"use client"

import { useMemo } from "react"
import { useFormContext, Control, FieldValues, Path, PathValue } from "react-hook-form"

import { ComboboxWithAdd } from "@/components/forms/combobox-with-add-field"
import { useModelOptions } from "../model.api"
import { useModelModal } from "../model-modal-context"

interface ModelComboboxFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>
  control: Control<TFieldValues>
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
}

export function ModelComboboxField<TFieldValues extends FieldValues>({
  name,
  control,
  label = "Model",
  placeholder = "Select Model",
  required = false,
  disabled = false,
}: ModelComboboxFieldProps<TFieldValues>) {
  const { setValue } = useFormContext<TFieldValues>()
  const { openModal } = useModelModal()
  const { data: modelOptionsData, isLoading } = useModelOptions()

  const modelOptions = useMemo(() => {
    const models = modelOptionsData || []
    return models.map((m) => ({
      value: m.id,
      label: m.name,
    }))
  }, [modelOptionsData])

  const handleAddModel = () => {
    openModal({
      onSuccess: (newModel) => {
        if (newModel?.id) {
          setValue(name, newModel.id as PathValue<TFieldValues, Path<TFieldValues>>)
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
        searchPlaceholder="Search models..."
        noResultsMessage="No model found."
        options={modelOptions}
        onAdd={handleAddModel}
        required={required}
        isLoading={isLoading}
        disabled={disabled}
      />
    </>
  )
}
