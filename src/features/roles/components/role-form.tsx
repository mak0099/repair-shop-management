"use client"

import { useState, useEffect } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ShieldCheck, Shield } from "lucide-react"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

import { TextField } from "@/components/forms/text-field"
import { CheckboxField } from "@/components/forms/checkbox-field"
import { Form } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FormFooter } from "@/components/forms/form-footer"

import { roleSchema, type RoleFormValues, type Role } from "../role.schema"
import { useCreateRole, useUpdateRole } from "../role.api"
import { PermissionsMatrix } from "@/features/permissions/components/permissions-matrix"
import { PermissionType } from "@/constants/permissions"

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

  const { control, handleSubmit, setValue, reset } = form
  const selectedPermissions = useWatch({ control, name: "permissions" }) as PermissionType[]

  useEffect(() => {
    if (initialData && mode !== 'create') {
       reset({
        name: initialData.name,
        slug: initialData.slug,
        description: initialData.description || "",
        permissions: initialData.permissions || [],
        isSystem: initialData.isSystem || false,
        isActive: initialData.isActive ?? true,
       })
    }
  }, [initialData, reset, mode])

  const onSubmit = (data: RoleFormValues) => {
    const options = {
      onSuccess: (role: Role) => {
        toast.success(`Role ${isEditMode ? "updated" : "created"} successfully`)
        queryClient.invalidateQueries({ queryKey: ["roles"] })
        onSuccess?.(role)
      },
      onError: (error: Error) => toast.error(error.message)
    }

    if (isEditMode && initialData?.id) {
      updateRole({ id: initialData.id, data }, options)
    } else {
      createRole(data, options)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 shadow-sm border-slate-200 h-fit">
            <CardHeader className="bg-slate-50/50 border-b py-4 px-5">
              <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-slate-500">
                <ShieldCheck className="h-4 w-4 text-blue-600" /> Identity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <TextField control={control} name="name" label="Role Name" required readOnly={isReadOnly} />
              <TextField control={control} name="slug" label="System Slug" required readOnly={isReadOnly} disabled={isEditMode && initialData?.isSystem} />
              <TextField control={control} name="description" label="Short Description" readOnly={isReadOnly} />
              <CheckboxField control={control} name="isActive" label="Active Role" disabled={isReadOnly} className="border rounded-lg p-3 bg-slate-50/50" />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50/50 border-b py-4 px-5 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-slate-500">
                <Shield className="h-4 w-4 text-emerald-600" /> Capabilities
              </CardTitle>
              <Badge variant="outline" className="bg-white">{selectedPermissions.length} Enabled</Badge>
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
          onCancel={() => onSuccess?.(initialData!)}
          onEdit={() => setMode("edit")}
          onReset={() => reset()}
          saveLabel={isEditMode ? "Update Role" : "Create Role"}
          className="bg-white p-4 rounded-xl border shadow-sm"
        />
      </form>
    </Form>
  )
}