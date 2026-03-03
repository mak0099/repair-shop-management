"use client"

import { useState, useEffect } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { User as UserIcon, Shield, Fingerprint } from "lucide-react"
import { TextField } from "@/components/forms/text-field"
import { CheckboxField } from "@/components/forms/checkbox-field"
import { Form } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { FormFooter } from "@/components/forms/form-footer"

import { userSchema, type UserFormValues, type User } from "../user.schema"
import { RoleSelectField } from "@/features/roles"
import { PermissionsMatrix } from "@/features/permissions/components/permissions-matrix"
import { PermissionType } from "@/constants/permissions"

interface UserFormProps {
  initialData?: User | null
  onSuccess?: (data: User) => void
  isViewMode?: boolean
}

export function UserForm({ initialData, onSuccess, isViewMode = false }: UserFormProps) {
  /**
   * FIX: Initializing state directly from props/data.
   * This avoids calling setState inside useEffect and prevents cascading renders.
   */
  const [mode, setMode] = useState<"view" | "edit" | "create">(() => {
    if (isViewMode) return "view"
    return initialData ? "edit" : "create"
  })

  const [showExtra, setShowExtra] = useState(() => {
    return !!initialData?.extraPermissions?.length
  })

  const isReadOnly = mode === "view"
  const isEditMode = !!initialData && mode !== "create"

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      password: "",
      roleIds: initialData?.roleIds || [],
      isActive: initialData?.isActive ?? true,
      extraPermissions: initialData?.extraPermissions || [],
      phone: initialData?.phone || ""
    }
  })

  const { control, handleSubmit, setValue, reset } = form

  const extraPermissions = (useWatch({
    control,
    name: "extraPermissions",
  }) as PermissionType[]) || []

  const isActive = useWatch({
    control,
    name: "isActive",
  })

  /**
   * Only use useEffect for form reset when initialData changes.
   * We removed setShowExtra and setMode from here.
   */
  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        email: initialData.email,
        password: "", 
        roleIds: initialData.roleIds || [],
        isActive: initialData.isActive ?? true,
        extraPermissions: initialData.extraPermissions || [],
        phone: initialData.phone || ""
      })
    }
  }, [initialData, reset])

  const onSubmit = (values: UserFormValues) => {
    const finalData: User = {
      ...initialData,
      ...values,
      extraPermissions: (showExtra ? values.extraPermissions : []) as PermissionType[],
      // Dates and IDs should be handled by the API/Mock
    } as User

    if (onSuccess) {
      onSuccess(finalData)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-5xl mx-auto pb-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="py-4 px-5 border-b bg-slate-50/50">
              <CardTitle className="text-[10px] uppercase font-black flex items-center gap-2 text-slate-500 tracking-widest">
                <UserIcon className="h-4 w-4 text-blue-500" /> Identity Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <TextField control={control} name="name" label="Full Name" required readOnly={isReadOnly} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField control={control} name="email" label="Email Address" type="email" required readOnly={isReadOnly} />
                <TextField control={control} name="phone" label="Phone Number" readOnly={isReadOnly} />
              </div>
              {!isReadOnly && (
                <TextField control={control} name="password" label={isEditMode ? "Change Password" : "Initial Password"} type="password" />
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200">
            <CardHeader className="py-4 px-5 border-b bg-slate-50/50">
              <CardTitle className="text-[10px] uppercase font-black flex items-center gap-2 text-slate-500 tracking-widest">
                <Shield className="h-4 w-4 text-emerald-500" /> Access Control
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-6">
              <RoleSelectField control={control} name="roleIds" label="Assign Roles" isMulti required readOnly={isReadOnly} />
              
              <div className={cn(
                "flex items-center justify-between p-4 rounded-lg border transition-all",
                isReadOnly ? "bg-slate-50 border-slate-100" : "bg-white border-slate-200 shadow-sm"
              )}>
                <div className="space-y-1">
                  <span className="text-sm font-bold text-slate-700 block">Login Access</span>
                  <span className="text-[10px] text-slate-500">
                    {isActive ? "Authorized for system login" : "Account access suspended"}
                  </span>
                </div>
                <CheckboxField control={control} name="isActive" label="" disabled={isReadOnly} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between p-4 bg-slate-50/40 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", showExtra ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-500")}>
                <Fingerprint className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Special Extra Permissions</h4>
                <p className="text-[10px] text-slate-500">Override role-based capabilities</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
               {extraPermissions.length > 0 && showExtra && (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200 text-[9px] font-bold">
                    {extraPermissions.length} OVERRIDES
                  </Badge>
               )}
               <Switch checked={showExtra} onCheckedChange={setShowExtra} disabled={isReadOnly} />
            </div>
          </div>

          {showExtra && (
            <div className="bg-white">
              <PermissionsMatrix 
                value={extraPermissions} 
                onChange={(val) => setValue("extraPermissions", val, { shouldDirty: true })} 
                readOnly={isReadOnly}
                className="border-t-0"
              />
            </div>
          )}
        </div>

        <FormFooter
          isViewMode={isReadOnly}
          isEditMode={isEditMode}
          onCancel={() => onSuccess?.(initialData!)}
          onEdit={() => setMode("edit")}
          onReset={() => reset()}
          saveLabel={isEditMode ? "Update User" : "Create User Member"}
          className="mt-4"
        />
      </form>
    </Form>
  )
}