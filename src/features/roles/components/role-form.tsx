"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ShieldCheck, Shield } from "lucide-react"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

import { TextField } from "@/components/forms/text-field"
import { CheckboxField } from "@/components/forms/checkbox-field"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FormFooter } from "@/components/forms/form-footer"

import { roleSchema, type RoleFormValues, type Role } from "../role.schema"
import { useCreateRole, useUpdateRole } from "../role.api"
import { PermissionsMatrix } from "@/features/permissions/components/permissions-matrix"

interface RoleFormProps {
  initialData?: Role | null
  onSuccess?: (data: Role) => void
  isViewMode?: boolean
}

export function RoleForm({ initialData, onSuccess, isViewMode = false }: RoleFormProps) {
  const queryClient = useQueryClient()
  const { mutate: createRole, isPending: isCreating } = useCreateRole()
  const { mutate: updateRole, isPending: isUpdating } = useUpdateRole()
  
  const [mode, setMode] = useState<"view" | "edit" | "create">(
    isViewMode ? "view" : initialData ? "edit" : "create"
  )
  const isReadOnly = mode === "view"
  const isEditMode = !!initialData && mode !== "create"
  const isPending = isCreating || isUpdating

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      slug: initialData.slug,
      description: initialData.description || "",
      permissions: initialData.permissions || [],
      isSystem: initialData.isSystem || false,
      isActive: initialData.isActive ?? true,
    } : {
      name: "",
      slug: "",
      description: "",
      permissions: [],
      isSystem: false,
      isActive: true,
    }
  })

  const { control, handleSubmit, watch, setValue, reset } = form
  const selectedPermissions = watch("permissions") || []

  useEffect(() => {
    if (initialData && !isEditMode && mode !== 'create') {
       reset({
        name: initialData.name,
        slug: initialData.slug,
        description: initialData.description || "",
        permissions: initialData.permissions || [],
        isSystem: initialData.isSystem || false,
        isActive: initialData.isActive ?? true,
       })
    }
  }, [initialData, reset, isEditMode, mode])

  const onSubmit = (data: RoleFormValues) => {
    const onSuccessCallback = (role: Role) => {
      toast.success(`Role ${isEditMode ? "updated" : "created"} successfully`)
      queryClient.invalidateQueries({ queryKey: ["roles"] })
      onSuccess?.(role)
    }

    const onErrorCallback = (error: Error) => {
      toast.error(`Failed to ${isEditMode ? "update" : "create"} role: ${error.message}`)
    }

    if (isEditMode && initialData?.id) {
      updateRole({ id: initialData.id, data }, { onSuccess: onSuccessCallback, onError: onErrorCallback })
    } else {
      createRole(data, { onSuccess: onSuccessCallback, onError: onErrorCallback })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-1">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Identity Info */}
          <Card className="md:col-span-1 shadow-sm border-slate-200 h-fit">
            <CardHeader className="bg-slate-50/50 border-b py-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-600" /> Role Identity
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <TextField 
                control={control} 
                name="name" 
                label="Role Name" 
                placeholder="e.g. Shop Manager" 
                required 
                readOnly={isReadOnly}
              />
              <TextField 
                control={control} 
                name="slug" 
                label="System Slug" 
                placeholder="e.g. manager" 
                required 
                readOnly={isReadOnly}
                disabled={isEditMode && initialData?.isSystem}
              />
              <TextField 
                control={control} 
                name="description" 
                label="Short Description" 
                readOnly={isReadOnly}
              />
              <div className="pt-2">
                <CheckboxField 
                  control={control} 
                  name="isActive" 
                  label="This role is active" 
                  disabled={isReadOnly}
                  className="border rounded-lg p-3 bg-slate-50/50"
                />
              </div>
            </CardContent>
          </Card>

          {/* Permissions Matrix */}
          <Card className="md:col-span-2 shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50/50 border-b py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Shield className="h-4 w-4 text-emerald-600" /> Capabilities & Permissions
                </CardTitle>
                <Badge variant="outline" className="bg-white">
                  {selectedPermissions.length} Selected
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <PermissionsMatrix 
                value={selectedPermissions} 
                onChange={(val) => setValue("permissions", val, { shouldDirty: true, shouldValidate: true })}
                readOnly={isReadOnly}
              />
            </CardContent>
          </Card>
        </div>

        <FormFooter
          isViewMode={isReadOnly}
          isEditMode={isEditMode}
          isPending={isPending}
          onCancel={() => onSuccess?.(initialData!) || reset()}
          onEdit={() => setMode("edit")}
          onReset={() => reset()}
          saveLabel={isEditMode ? "Update Role" : "Create Role"}
          className="pt-6 border-t mt-6"
        />
      </form>
    </Form>
  )
}
