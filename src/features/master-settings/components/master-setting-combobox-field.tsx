"use client"

import { useMemo } from "react"
import { useFormContext, Control, FieldValues, Path, PathValue } from "react-hook-form"

import { ComboboxWithAdd } from "@/components/forms/combobox-with-add-field"
import { useMasterSettingOptions } from "../master-setting.api"
import { useMasterSettingModal } from "../master-setting-modal-context"
import { SettingType } from "@/types/common"

interface MasterSettingComboboxFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>
  control: Control<TFieldValues>
  type: SettingType
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
}

export function MasterSettingComboboxField<TFieldValues extends FieldValues>({
  name,
  control,
  type,
  label = "Value",
  placeholder = "Select a value",
  required = false,
  disabled = false,
}: MasterSettingComboboxFieldProps<TFieldValues>) {
  const { setValue } = useFormContext<TFieldValues>()
  const { openModal } = useMasterSettingModal()
  const { data: optionsData, isLoading } = useMasterSettingOptions(type)

  const comboboxOptions = useMemo(() => {
    const options = optionsData || []
    return options.map((o) => ({
      value: o.value, // Using value field for the combobox value
      label: o.label,
    }))
  }, [optionsData])

  const handleAdd = () => {
    openModal({
      onSuccess: (newSetting) => {
        if (newSetting?.value) {
          setValue(name, newSetting.value as PathValue<TFieldValues, Path<TFieldValues>>)
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
        searchPlaceholder={`Search ${type.toLowerCase()}...`}
        noResultsMessage={`No ${type.toLowerCase()} found.`}
        options={comboboxOptions}
        onAdd={handleAdd}
        required={required}
        isLoading={isLoading}
        disabled={disabled}
      />
    </>
  )
}
