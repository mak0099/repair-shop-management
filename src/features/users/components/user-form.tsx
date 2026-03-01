"use client"

import { useState, useEffect } from "react"
import { useForm, FieldErrors } from "react-hook-form"
import { useQueryClient } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Edit3 } from "lucide-react"

import { cn } from "@/lib/utils"
import { TextField } from "@/components/forms/text-field"
import { CheckboxField } from "@/components/forms/checkbox-field"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Card, CardContent } from "@/components/ui/card"
import { FormFooter } from "@/components/forms/form-footer"
import { RadioGroupField } from "@/components/forms/radio-group-field"

import { userSchema, UserFormValues, User } from "../user.schema"
import { useCreateUser, useUpdateUser } from "../user.api"
import { ROLE_OPTIONS } from "../user.constants"

interface UserFormProps {
  initialData?: User | null
  onSuccess?: (data: User) => void
  isViewMode?: boolean
}

export function UserForm({ initialData, onSuccess, isViewMode: initialIsViewMode = false }: UserFormProps) {
  const queryClient = useQueryClient()
  const { mutate: createUser, isPending: isCreating } = useCreateUser()
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser()

  const [mode, setMode] = useState<"view" | "edit" | "create">(
    initialIsViewMode ? "view" : initialData ? "edit" : "create"
  )
  const isViewMode = mode === "view"
  const isPending = isCreating || isUpdating
  const isEditMode = !!initialData && mode !== "create"

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      email: initialData.email,
      role: initialData.role,
      isActive: initialData.isActive,
      password: "",
    } : {
      name: "",
      email: "",
      password: "",
      role: "TECHNICIAN",
      isActive: true,
    },
  })

  useEffect(() => {
    if (isEditMode && initialData) {
      form.reset({ 
        name: initialData.name,
        email: initialData.email,
        role: initialData.role,
        isActive: initialData.isActive,
        password: "", 
      })
    }
  }, [initialData, isEditMode, form])

  const onFormError = (errors: FieldErrors<UserFormValues>) => {
    console.error("User form validation errors:", errors)
    toast.error("Please fill all required fields correctly.")
  }

  function onSubmit(data: UserFormValues) {
    // If updating and password is empty, don't send it to the server
    const dataToSubmit = { ...data };
    if (isEditMode && !data.password) {
      delete dataToSubmit.password;
    }
    
    const mutationCallbacks = {
      onSuccess: (res: User) => {
        toast.success(`User ${isEditMode ? "updated" : "created"} successfully`)
        queryClient.invalidateQueries({ queryKey: ["users"] })
        if (onSuccess) onSuccess(res)
      },
      onError: (error: Error) => {
        toast.error(`Error: ${error.message}`)
      }
    }

    if (isEditMode && initialData) {
      updateUser({ id: initialData.id, data: dataToSubmit }, mutationCallbacks)
    } else {
      createUser(dataToSubmit, mutationCallbacks)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onFormError)} className="space-y-4 p-1">
        <Card className="relative border-slate-200 shadow-sm overflow-hidden">
          <CardContent className={cn("space-y-6")}>
            <div className="grid grid-cols-1 gap-6">
              <TextField control={form.control} name="name" label="Full Name" required readOnly={isViewMode} />
              <TextField control={form.control} name="email" label="Corporate Email" type="email" required readOnly={isViewMode} />
            {!isViewMode && (
              <TextField
                control={form.control}
                name="password"
                label="Password"
                type="password"
                required={!isEditMode}
                placeholder={isEditMode ? "Leave blank to keep current" : "Min 6 characters"}
              />
            )}
            </div>

            <RadioGroupField
              control={form.control}
              name="role"
              label="System Access Role"
              options={ROLE_OPTIONS.filter(o => o.value !== 'all')}
              required
              readOnly={isViewMode}
              layout="partial-horizontal"
            />

            <div className="pt-2">
              <CheckboxField
                control={form.control}
                name="isActive"
                label="Account Active"
                description="Users can only login if their account is active."
                className="rounded-xl border border-slate-100 p-4 bg-slate-50/50"
                disabled={isViewMode}
              />
            </div>
          </CardContent>
        </Card>

        <FormFooter
          isViewMode={isViewMode}
          isEditMode={isEditMode}
          isPending={isPending}
          onCancel={() => onSuccess?.(initialData!)}
          onEdit={() => setMode("edit")}
          onReset={() => form.reset()}
          saveLabel={isEditMode ? "Save Changes" : "Create User"}
          className="pt-4 border-t border-slate-100"
        />
      </form>
    </Form>
  )
}