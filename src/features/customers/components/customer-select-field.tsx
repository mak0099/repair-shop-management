"use client"

import { useMemo } from "react"
import { useFormContext, Control, FieldValues, Path, PathValue } from "react-hook-form"

import { SelectField } from "@/components/forms/select-field";
import { useCustomerOptions } from "../customer.api";
import { useCustomerModal } from "../customer-modal-context";

interface CustomerSelectFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>
  control: Control<TFieldValues>
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
}

export function CustomerSelectField<TFieldValues extends FieldValues>({
  name,
  control,
  label = "Customer Name",
  placeholder = "Select Customer",
  required = false,
  disabled = false,
  readOnly = false,
}: CustomerSelectFieldProps<TFieldValues>) {
  const { setValue } = useFormContext<TFieldValues>()
  const { openModal } = useCustomerModal()
  const { data: customerOptionsData, isLoading } = useCustomerOptions()

  const customerOptions = useMemo(() => {
    const customers = customerOptionsData || []
    return customers.map((c) => ({
      value: c.id,
      label: `${c.name} (${c.mobile})`,
    }))
  }, [customerOptionsData])

  const handleAddCustomer = () => {
    openModal({
      onSuccess: (newCustomer) => {
        if (newCustomer?.id) {
          setValue(name, newCustomer.id as PathValue<TFieldValues, Path<TFieldValues>>)
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
        searchPlaceholder="Search by name or mobile..."
        noResultsMessage="No customer found."
        options={customerOptions}
        onAdd={handleAddCustomer}
        required={required}
        isLoading={isLoading}
        disabled={disabled}
        readOnly={readOnly}
      />
    </>
  )
}