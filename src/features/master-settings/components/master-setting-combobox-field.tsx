"use client"

import { useMemo } from "react"
import { Control, FieldValues, Path } from "react-hook-form"

import { ComboboxWithAdd } from "@/components/forms/combobox-with-add-field"
import { useMasterSettings } from "../master-setting.api"
import { useMasterSettingModal } from "../master-setting-modal-context"

interface MasterSettingComboboxFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>
  control: Control<TFieldValues>
  type: "DEVICE_TYPE" | "PAYMENT_METHOD" | "EXPENSE_CATEGORY" | "QC_ITEM" | "REPAIR_STATUS" | "RETURN_STATUS" | "DESIGNATION" | "COLOR" | "ACCESSORY" | "WARRANTY"
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
}

export function MasterSettingComboboxField<TFieldValues extends FieldValues>({
  name,
  control,
  type,
  label,
  placeholder,
  required = false,
  disabled = false,
  readOnly = false,
}: MasterSettingComboboxFieldProps<TFieldValues>) {
  const { openModal } = useMasterSettingModal()
  const { data: allSettings, isLoading } = useMasterSettings()

  const { masterData, options } = useMemo(() => {
    if (!type) return { masterData: undefined, options: [] }
    
    const found = allSettings?.find(
      (m) => m.key?.toUpperCase() === type.toUpperCase()
    )
    
    const mappedOptions = found?.values.map((v) => ({
      value: v.value,
      label: v.value,
    })) || []

    return { masterData: found, options: mappedOptions }
  }, [allSettings, type])

  const handleAddValue = () => {
    if (!masterData) return
    openModal({
      initialData: masterData,
      title: `Edit: ${masterData.name}`,
    })
  }

  return (
    <ComboboxWithAdd
      // FIX: Casting to any here solves the variance issue internally
      // so you don't have to use 'as any' in AcceptanceForm.
      control={control as any}
      name={name as any}
      label={label || masterData?.name || type}
      placeholder={placeholder || `Select ${masterData?.name || type}`}
      searchPlaceholder={`Search ${masterData?.name || "values"}...`}
      noResultsMessage="No values found."
      options={options}
      onAdd={handleAddValue}
      required={required}
      isLoading={isLoading}
      disabled={disabled || !masterData}
      readOnly={readOnly}
    />
  )
}