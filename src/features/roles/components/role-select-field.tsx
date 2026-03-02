"use client"

import { useMemo } from "react"
import { useFormContext, Control, FieldValues, Path, PathValue } from "react-hook-form"

import { SelectField } from "@/components/forms/select-field"
import { useRoleOptions } from "../role.api"
import { useRoleModal } from "../role-modal-context"

interface RoleSelectFieldProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>
  control: Control<TFieldValues>
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
  isMulti?: boolean
}

export function RoleSelectField<TFieldValues extends FieldValues>({
  name,
  control,
  label = "Role",
  placeholder = "Select Role",
  required = false,
  disabled = false,
  readOnly = false,
  isMulti = false,
}: RoleSelectFieldProps<TFieldValues>) {
  const { setValue } = useFormContext<TFieldValues>()
  const { openModal } = useRoleModal()
  const { data: roleOptionsData, isLoading } = useRoleOptions()

  const roleOptions = useMemo(() => {
    const roles = roleOptionsData || []
    return roles.map((u) => ({
      value: u.id,
      label: u.name,
    }))
  }, [roleOptionsData])

  const handleAddRole = () => {
    openModal({
      onSuccess: (newRole) => {
        if (newRole?.id) {
          setValue(name, newRole.id as PathValue<TFieldValues, Path<TFieldValues>>)
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
        searchPlaceholder="Search roles..."
        noResultsMessage="No role found."
        options={roleOptions}
        onAdd={handleAddRole}
        required={required}
        isLoading={isLoading}
        disabled={disabled}
        readOnly={readOnly}
        isMulti={isMulti}
      />
    </>
  )
}
