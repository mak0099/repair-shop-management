"use client"

import { useState } from "react"
import { useFormContext, Control, FieldValues, Path, PathValue } from "react-hook-form"

import { Modal } from "@/components/shared/modal"
import { ComboboxWithAdd } from "@/components/forms/combobox-with-add-field"
import { useCustomers } from "@/features/customers/customer.api"
import { CustomerForm } from "@/features/customers/components/customer-form"
import { Customer } from "@/features/customers/types/customer"

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
  const { setValue } = useFormContext<TFieldValues>()
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false)

  const { data: customersData, isLoading } = useCustomers({ pageSize: 1000, search: "" })
  const customers = customersData?.data || []

  const customerOptions = customers.map((c) => ({
    value: c.id,
    label: `${c.name} (${c.mobile})`,
  }))

  const handleCustomerSuccess = (newCustomer: Customer) => {
    setIsCustomerModalOpen(false)
    if (newCustomer?.id) {
      setValue(name, newCustomer.id as PathValue<TFieldValues, Path<TFieldValues>>, { shouldValidate: true })
    }
  }

  return (
    <>
      <Modal
        title="Add New Customer"
        description="Create a new customer record."
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <CustomerForm onSuccess={handleCustomerSuccess} />
      </Modal>

      <ComboboxWithAdd
        control={control}
        name={name}
        label={label}
        placeholder={placeholder}
        searchPlaceholder="Search by name or mobile..."
        noResultsMessage="No customer found."
        options={customerOptions}
        onAdd={() => setIsCustomerModalOpen(true)}
        required={required}
        isLoading={isLoading}
      />
    </>
  )
}