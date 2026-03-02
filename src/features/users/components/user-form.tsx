"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
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

interface UserFormProps {
  initialData?: User | null
  onSuccess?: (data: User) => void
  isViewMode?: boolean
}

export function UserForm({ initialData, onSuccess, isViewMode = false }: UserFormProps) {
  const [mode, setMode] = useState<"view" | "edit" | "create">(
    isViewMode ? "view" : initialData ? "edit" : "create"
  )
  const isReadOnly = mode === "view"
  const isEditMode = !!initialData && mode !== "create"
  
  const [showExtra, setShowExtra] = useState(false)

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "", email: "", password: "", roleIds: [], isActive: true, extraPermissions: []
    }
  })

  const { control, handleSubmit, watch, setValue, reset } = form
  const extraPermissions = watch("extraPermissions") || []

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name,
        email: initialData.email,
        password: "", // Password field reset for security
        roleIds: initialData.roleIds || [],
        isActive: initialData.isActive,
        extraPermissions: initialData.extraPermissions || []
      })
      setShowExtra(!!initialData.extraPermissions?.length)
    }
    if (isViewMode) {
        setMode("view")
    }
  }, [initialData, reset, isViewMode])

  const onSubmit = (data: UserFormValues) => {
    const finalData = {
      ...data,
      extraPermissions: showExtra ? data.extraPermissions : []
    }
    console.log("Submitting User Data:", finalData)
    // In a real scenario, you would call the API mutation here
    if (onSuccess && initialData) {
        onSuccess({ ...initialData, ...finalData } as User)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-5xl mx-auto pb-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Identity Section */}
          <Card className="shadow-sm border-slate-200 h-full">
            <CardHeader className="py-4 px-5 border-b bg-slate-50/50">
              <CardTitle className="text-sm uppercase font-bold flex items-center gap-2 text-slate-600 tracking-wide">
                <UserIcon className="h-4 w-4 text-blue-500" /> Identity Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <TextField 
                control={control} 
                name="name" 
                label="Full Name" 
                placeholder="e.g. John Doe" 
                required 
                readOnly={isReadOnly}
                inputClassName="bg-white"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField 
                    control={control} 
                    name="email" 
                    label="Email Address" 
                    type="email" 
                    placeholder="john@example.com" 
                    required 
                    readOnly={isReadOnly}
                    inputClassName="bg-white"
                />
                <TextField 
                    control={control} 
                    name="phone" 
                    label="Phone Number" 
                    placeholder="+1 234 567 890" 
                    readOnly={isReadOnly}
                    inputClassName="bg-white"
                />
              </div>
              {!isReadOnly && (
                  <TextField 
                    control={control} 
                    name="password" 
                    label={isEditMode ? "New Password (Optional)" : "Initial Password"} 
                    type="password" 
                    placeholder="••••••••" 
                    readOnly={isReadOnly}
                    inputClassName="bg-white"
                  />
              )}
            </CardContent>
          </Card>

          {/* Access Control Section */}
          <Card className="shadow-sm border-slate-200 h-full">
            <CardHeader className="py-4 px-5 border-b bg-slate-50/50">
              <CardTitle className="text-sm uppercase font-bold flex items-center gap-2 text-slate-600 tracking-wide">
                <Shield className="h-4 w-4 text-emerald-500" /> Access Control
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-6">
              <RoleSelectField 
                control={control} 
                name="roleIds" 
                label="Assigned Roles" 
                isMulti={true} 
                required 
                readOnly={isReadOnly}
                placeholder="Select roles..." 
              />
              
              <div className={cn(
                  "flex items-center justify-between p-4 rounded-lg border transition-colors",
                  isReadOnly ? "bg-slate-50 border-slate-100" : "bg-white border-slate-200"
              )}>
                <div className="space-y-1">
                  <span className="text-sm font-semibold text-slate-700 block">Account Status</span>
                  <span className="text-xs text-slate-500">
                    {isReadOnly 
                        ? (form.getValues("isActive") ? "User can log in" : "User is suspended") 
                        : "Enable or disable user login access"
                    }
                  </span>
                </div>
                <CheckboxField 
                    control={control} 
                    name="isActive" 
                    label={isReadOnly ? (form.getValues("isActive") ? "Active" : "Inactive") : "Active"} 
                    disabled={isReadOnly}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Extra Permissions Section */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between p-4 bg-slate-50/40 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg transition-colors", showExtra ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-500")}>
                <Fingerprint className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Additional Permissions</h4>
                <p className="text-xs text-slate-500">Grant specific capabilities outside of roles</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
               {extraPermissions.length > 0 && showExtra && (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">
                    {extraPermissions.length} Custom
                  </Badge>
               )}
               <Switch 
                checked={showExtra} 
                onCheckedChange={setShowExtra} 
                disabled={isReadOnly}
               />
            </div>
          </div>

          {showExtra && (
            <div className="bg-slate-50/20">
                <PermissionsMatrix 
                value={extraPermissions} 
                onChange={(val) => setValue("extraPermissions", val, { shouldDirty: true })} 
                readOnly={isReadOnly}
                className="animate-in fade-in slide-in-from-top-2 duration-300 border-t-0"
                />
            </div>
          )}
        </div>

        <FormFooter
            isViewMode={isReadOnly}
            isEditMode={isEditMode}
            onCancel={() => onSuccess?.(initialData!) || reset()}
            onEdit={() => setMode("edit")}
            onReset={() => reset()}
            saveLabel={isEditMode ? "Update User" : "Create User"}
            className="pt-2"
        />
      </form>
    </Form>
  )
}
