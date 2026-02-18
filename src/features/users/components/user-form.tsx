"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm, FieldErrors } from "react-hook-form"
import { useQueryClient } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { TextField } from "@/components/forms/text-field"
import { CheckboxField } from "@/components/forms/checkbox-field"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { RadioGroupField } from "@/components/forms/radio-group-field"

import { userSchema, UserFormValues, User } from "../user.schema"
import { useCreateUser, useUpdateUser } from "../user.api"
import { ROLE_OPTIONS } from "../user.constants"

const USERS_BASE_HREF = "/dashboard/system/users"

interface UserFormProps {
  initialData?: User | null
  onSuccess?: (data: User) => void
  isViewMode?: boolean
}

export function UserForm({ initialData, onSuccess, isViewMode: initialIsViewMode = false }: UserFormProps) {
  const router = useRouter()
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
    defaultValues: initialData || {
      name: "",
      email: "",
      password: "",
      role: "TECHNICIAN",
      isActive: true,
    },
  })

  useEffect(() => {
    // In edit mode, reset the form with initial data but clear the password field.
    // This effect runs when the component mounts or when initialData/mode changes.
    if (isEditMode && initialData) {
      form.reset({ ...initialData, password: "" })
    }
  }, [initialData, isEditMode, form.reset])
  const onFormError = (errors: FieldErrors<UserFormValues>) => {
    console.error("User form validation errors:", errors)
    toast.error("Please fill all required fields correctly.")
  }

  const handleCancel = () => {
    if (onSuccess) {
      // In view mode, onSuccess is used to close the modal.
      // We pass initialData to ensure any parent state is not cleared.
      onSuccess(initialData as User)
    } else {
      router.push(USERS_BASE_HREF)
    }
  }

  function onSubmit(data: UserFormValues) {
    const dataToSubmit = {...data};
    if (isEditMode && !data.password) {
      delete dataToSubmit.password;
    }
    
    if (isEditMode && initialData) {
      updateUser(
        { id: initialData.id, data: dataToSubmit },
        {
          onSuccess: (updatedUser: User) => {
            toast.success("User updated successfully")
            queryClient.invalidateQueries({ queryKey: ["users"] })
            if (onSuccess) {
              onSuccess(updatedUser)
            } else {
              router.push(USERS_BASE_HREF)
            }
          },
          onError: (error) => {
            toast.error("Failed to update user: " + error.message)
          },
        }
      )
    } else {
      createUser(dataToSubmit, {
        onSuccess: (newUser) => {
          toast.success("User created successfully")
          queryClient.invalidateQueries({ queryKey: ["users"] })
          if (onSuccess) {
            onSuccess(newUser)
          } else {
            router.push(USERS_BASE_HREF)
          }
        },
        onError: (error) => {
          toast.error("Failed to create user: " + error.message)
        },
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onFormError)} className="relative p-4 space-y-4">
        {isViewMode && (
          <div className="absolute top-4 right-4 z-10">
            <Button size="sm" type="button" onClick={(e) => { e.preventDefault(); setMode("edit"); }}>
              Edit
            </Button>
          </div>
        )}
        <div className={isViewMode ? "pt-10" : ""}>
          <TextField control={form.control} name="name" label="Full Name" required readOnly={isViewMode} placeholder="e.g., John Doe" />
          <TextField control={form.control} name="email" label="Email" type="email" required readOnly={isViewMode} placeholder="e.g., john.doe@example.com" />
          {!isViewMode && (
            <TextField
              control={form.control}
              name="password"
              label="Password"
              type="password"
              required={!isEditMode}
              placeholder={isEditMode ? "Leave blank to keep current" : ""}
            />
          )}
          <RadioGroupField
            control={form.control}
            name="role"
            label="Role"
            options={ROLE_OPTIONS.filter(o => o.value !== 'all')}
            required
            disabled={isViewMode}
          />
          <CheckboxField
            control={form.control}
            name="isActive"
            label="Is Active?"
            className="rounded-md border p-3"
            disabled={isViewMode}
          />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          {isViewMode ? (
            <Button variant="outline" type="button" onClick={handleCancel}>Close</Button>
          ) : (
            <>
              <Button variant="outline" type="button" onClick={handleCancel}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? "Save Changes" : "Save User"}
              </Button>
            </>
          )}
        </div>
      </form>
    </Form>
  )
}
