"use client"

import { useMemo } from "react"
import { useFormContext, Control, FieldValues, Path, PathValue } from "react-hook-form"
import { SelectField } from "@/components/forms/select-field"
import { useModels } from "../model.api"
import { useModelModal } from "../model-modal-context"

interface ModelSelectFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>
  control: Control<TFieldValues>
  brandId?: string
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
}

export function ModelSelectField<TFieldValues extends FieldValues>({
  name,
  control,
  brandId,
  label = "Model",
  placeholder = "Select Model",
  required = false,
  disabled = false,
  readOnly = false,
}: ModelSelectFieldProps<TFieldValues>) {
  const { setValue } = useFormContext<TFieldValues>()
  const { openModal } = useModelModal()

  /**
   * Fetches models filtered by brandId. 
   * The query is only enabled when a brandId is provided.
   */
  const { data: modelsData, isLoading } = useModels(
    brandId 
      ? { brand_id: brandId, pageSize: -1 } 
      : undefined
  );

  const modelOptions = useMemo(() => {
    const models = modelsData?.data || []
    return models.map((m) => ({
      value: m.id,
      label: m.name,
    }))
  }, [modelsData])

  const handleAddModel = () => {
    if (!brandId) return; // Guard clause

    openModal({
      brandId,
      onSuccess: (newModel) => {
        if (newModel?.id) {
          setValue(
            name, 
            newModel.id as PathValue<TFieldValues, Path<TFieldValues>>,
            { shouldValidate: true }
          )
        }
      },
    })
  }

  return (
    <SelectField
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
      disabled={disabled || !brandId}
      readOnly={readOnly}
    />
  )
}