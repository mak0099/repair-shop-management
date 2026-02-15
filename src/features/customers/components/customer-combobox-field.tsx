"use client"

import { useFormContext, Control, FieldValues, Path, PathValue } from "react-hook-form"

import { ComboboxWithAdd } from "@/components/forms/combobox-with-add-field";
import { useCustomerOptions } from "../customer.api";
import { useCustomerModal } from "../customer-modal-context";

interface CustomerComboboxFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>
  control: Control<TFieldValues>
  label?: string
  placeholder?: string
  required?: boolean
}

export function CustomerComboboxField<TFieldValues extends FieldValues>({
  name,
  control,
  label = "Customer Name",
  placeholder = "Select Customer",
  required = false,
}: CustomerComboboxFieldProps<TFieldValues>) {
  const { setValue, trigger } = useFormContext<TFieldValues>()
  const { openModal } = useCustomerModal()
  const { data: customerOptionsData, isLoading } = useCustomerOptions()
  const customers = customerOptionsData || []

  const customerOptions = customers.map((c) => ({
    value: c.id,
    label: `${c.name} (${c.mobile})`,
  }))

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
      <ComboboxWithAdd
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
      />
    </>
  )
}