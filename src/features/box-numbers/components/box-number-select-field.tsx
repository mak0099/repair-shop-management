"use client"

import { useMemo } from "react"
import { useFormContext, Control, FieldValues, Path, PathValue } from "react-hook-form"
import { SelectField } from "@/components/forms/select-field";
import { useBoxNumberOptions } from "../box-number.api";
import { useBoxNumberModal } from "../box-number-modal-context";

interface BoxNumberSelectFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>
  control: Control<TFieldValues>
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
}

export function BoxNumberSelectField<TFieldValues extends FieldValues>({
  name,
  control,
  label = "Box Number",
  placeholder = "Select BoxNo",
  required = false,
  disabled = false,
  readOnly = false,
}: BoxNumberSelectFieldProps<TFieldValues>) {
  const { setValue, trigger } = useFormContext<TFieldValues>()
  const { openModal } = useBoxNumberModal()
  const { data: boxNumberOptionsData, isLoading } = useBoxNumberOptions()

  const boxNumberOptions = useMemo(() => {
    const boxNumbers = boxNumberOptionsData || []
    return boxNumbers.map((b) => ({
      value: b.id,
      label: b.name, // Assuming 'name' is the display field for BoxNumber
    }))
  }, [boxNumberOptionsData])

  const handleAddBoxNumber = () => {
    openModal({
      onSuccess: (newBoxNumber) => {
        if (newBoxNumber?.id) {
          setValue(name, newBoxNumber.id as PathValue<TFieldValues, Path<TFieldValues>>)
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
        searchPlaceholder="Search box numbers..."
        noResultsMessage="No box number found."
        options={boxNumberOptions}
        onAdd={handleAddBoxNumber}
        required={required}
        isLoading={isLoading}
        disabled={disabled}
        readOnly={readOnly}
      />
    </>
  )
}