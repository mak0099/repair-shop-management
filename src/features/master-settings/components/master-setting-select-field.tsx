"use client"

import { useMemo } from "react"
import { Control, FieldValues, Path } from "react-hook-form"

import { SelectField } from "@/components/forms/select-field"
import { useMasterSettings } from "../master-setting.api"
import { useMasterSettingModal } from "../master-setting-modal-context"

/**
 * Standardized Master Setting Keys.
 * Strictly defined to ensure data integrity across all modules.
 */
export type MasterSettingType =
  | "DEVICE_TYPE"
  | "PAYMENT_METHOD"
  | "EXPENSE_CATEGORY"
  | "QC_ITEM"
  | "REPAIR_STATUS"
  | "RETURN_STATUS"
  | "DESIGNATION"
  | "COLOR"
  | "ACCESSORY"
  | "WARRANTY";

interface MasterSettingSelectFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>
  control: Control<TFieldValues>
  type: MasterSettingType
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
  className?: string
}

/**
 * A reusable Form Field component that connects Master Settings to a Combobox.
 * Uses strict Generics to maintain type safety without using 'any'.
 */
export function MasterSettingSelectField<TFieldValues extends FieldValues>({
  name,
  control,
  type,
  label,
  placeholder,
  required = false,
  disabled = false,
  readOnly = false,
  className,
}: MasterSettingSelectFieldProps<TFieldValues>) {
  const { openModal } = useMasterSettingModal()
  const { data: allSettings, isLoading } = useMasterSettings()

  /**
   * Logic: Finds the specific master setting group and maps its values.
   * Cached using useMemo for performance.
   */
  const { masterData, options } = useMemo(() => {
    const settingsList = allSettings?.data || []
    if (settingsList.length === 0) return { masterData: undefined, options: [] }
    
    // Strict comparison with the provided MasterSettingType
    const found = settingsList.find(
      (m) => m.key?.toUpperCase() === type.toUpperCase() || m.name?.toUpperCase() === type.toUpperCase()
    )
    
    const mappedOptions = found?.values.map((v) => ({
      value: v.value,
      label: v.value,
    })) || []

    return { masterData: found, options: mappedOptions }
  }, [allSettings?.data, type])

  /**
   * Opens the Master Setting management modal for the current type.
   */
  const handleAddValue = () => {
    if (!masterData) return
    openModal({
      initialData: masterData,
    })
  }

  return (
    <SelectField<TFieldValues>
      control={control}
      name={name}
      // Fallback label logic: MasterData Name > Humanized Type > Type
      label={label || masterData?.name || type.replace(/_/g, " ")}
      placeholder={placeholder || `Select ${masterData?.name || "option"}`}
      searchPlaceholder={`Search through ${masterData?.name || "list"}...`}
      noResultsMessage="No matches found in settings."
      options={options}
      onAdd={handleAddValue}
      required={required}
      isLoading={isLoading}
      disabled={disabled || !masterData}
      readOnly={readOnly}
      className={className}
    />
  )
}