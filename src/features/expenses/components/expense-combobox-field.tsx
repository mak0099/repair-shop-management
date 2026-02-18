"use client"

import { useMemo } from "react"
import { useFormContext, Control, FieldValues, Path, PathValue } from "react-hook-form"

import { ComboboxWithAdd } from "@/components/forms/combobox-with-add-field"
import { useExpenseOptions } from "../expense.api"
import { useExpenseModal } from "../expense-modal-context"

interface ExpenseComboboxFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>
  control: Control<TFieldValues>
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
}

export function ExpenseComboboxField<TFieldValues extends FieldValues>({
  name,
  control,
  label = "Expense",
  placeholder = "Select Expense",
  required = false,
  disabled = false,
}: ExpenseComboboxFieldProps<TFieldValues>) {
  const { setValue } = useFormContext<TFieldValues>()
  const { openModal } = useExpenseModal()
  const { data: expenseOptionsData, isLoading } = useExpenseOptions()

  const expenseOptions = useMemo(() => {
    const expenses = expenseOptionsData || []
    return expenses.map((e) => ({
      value: e.id,
      label: e.title,
    }))
  }, [expenseOptionsData])

  const handleAddExpense = () => {
    openModal({
      onSuccess: (newExpense) => {
        if (newExpense?.id) {
          setValue(name, newExpense.id as PathValue<TFieldValues, Path<TFieldValues>>)
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
        searchPlaceholder="Search expenses..."
        noResultsMessage="No expense found."
        options={expenseOptions}
        onAdd={handleAddExpense}
        required={required}
        isLoading={isLoading}
        disabled={disabled}
      />
    </>
  )
}
