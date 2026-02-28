"use client"

import { useMemo } from "react"
import { useFormContext, Control, FieldValues, Path, PathValue } from "react-hook-form"

import { SelectField } from "@/components/forms/select-field"
import { useUserOptions } from "../user.api"
import { useUserModal } from "../user-modal-context"

interface UserSelectFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>
  control: Control<TFieldValues>
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
}

export function UserSelectField<TFieldValues extends FieldValues>({
  name,
  control,
  label = "User",
  placeholder = "Select User",
  required = false,
  disabled = false,
  readOnly = false,
}: UserSelectFieldProps<TFieldValues>) {
  const { setValue } = useFormContext<TFieldValues>()
  const { openModal } = useUserModal()
  const { data: userOptionsData, isLoading } = useUserOptions()

  const userOptions = useMemo(() => {
    const users = userOptionsData || []
    return users.map((u) => ({
      value: u.id,
      label: u.name,
    }))
  }, [userOptionsData])

  const handleAddUser = () => {
    openModal({
      onSuccess: (newUser) => {
        if (newUser?.id) {
          setValue(name, newUser.id as PathValue<TFieldValues, Path<TFieldValues>>)
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
        searchPlaceholder="Search users..."
        noResultsMessage="No user found."
        options={userOptions}
        onAdd={handleAddUser}
        required={required}
        isLoading={isLoading}
        disabled={disabled}
        readOnly={readOnly}
      />
    </>
  )
}
