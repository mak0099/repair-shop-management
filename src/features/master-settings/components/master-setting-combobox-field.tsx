"use client"

import { useMemo } from "react"
import { Control, FieldValues, Path } from "react-hook-form"

import { ComboboxWithAdd } from "@/components/forms/combobox-with-add-field"
import { useMasterSettings } from "../master-setting.api"
import { useMasterSettingModal } from "../master-setting-modal-context"

interface MasterSettingComboboxFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>
  control: Control<TFieldValues>
  // Identifier key based on our systemMasters list
  settingKey: "DEVICE_TYPE" | "PAYMENT_METHOD" | "EXPENSE_CATEGORY" | "QC_ITEM" | "REPAIR_STATUS" | "RETURN_STATUS" | "DESIGNATION"
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
}

export function MasterSettingComboboxField<TFieldValues extends FieldValues>({
  name,
  control,
  settingKey,
  label,
  placeholder,
  required = false,
  disabled = false,
  readOnly = false,
}: MasterSettingComboboxFieldProps<TFieldValues>) {
  const { openModal } = useMasterSettingModal()
  
  // Fetch all master settings from the API
  const { data: allSettings, isLoading } = useMasterSettings()

  // Find the specific setting by KEY and prepare dropdown options
  const { masterData, options } = useMemo(() => {
    // Guard against missing settingKey prop to prevent crashes.
    if (!settingKey) return { masterData: undefined, options: [] }
    const found = allSettings?.find(
      (m) => m.key?.toUpperCase() === settingKey.toUpperCase()
    )
    
    const mappedOptions = found?.values.map((v) => ({
      value: v.value,
      label: v.value,
    })) || []

    return { masterData: found, options: mappedOptions }
  }, [allSettings, settingKey])

  const handleAddValue = () => {
    if (!masterData) return

    // Open the modal using the correct props-based signature
    openModal({
      initialData: masterData,
      title: `Edit: ${masterData.name}`,
    })
  }

  return (
    <ComboboxWithAdd
      control={control}
      name={name}
      label={label || masterData?.name || settingKey}
      placeholder={placeholder || `Select ${masterData?.name || settingKey}`}
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