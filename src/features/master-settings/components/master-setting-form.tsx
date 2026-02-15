"use client"

import { useState } from "react"
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

import { masterSettingSchema, MasterSettingFormValues, MasterSetting } from "../master-setting.schema"
import { useCreateMasterSetting, useUpdateMasterSetting } from "../master-setting.api"
import { MASTER_SETTING_TYPE_OPTIONS } from "../master-setting.constants"

const MASTER_SETTINGS_BASE_HREF = "/dashboard/options/settings"

interface MasterSettingFormProps {
  initialData?: MasterSetting | null
  onSuccess?: (data: MasterSetting) => void
  isViewMode?: boolean
}

export function MasterSettingForm({ initialData, onSuccess, isViewMode: initialIsViewMode = false }: MasterSettingFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { mutate: createMasterSetting, isPending: isCreating } = useCreateMasterSetting()
  const { mutate: updateMasterSetting, isPending: isUpdating } = useUpdateMasterSetting()

  const [mode, setMode] = useState<"view" | "edit" | "create">(
    initialIsViewMode ? "view" : initialData ? "edit" : "create"
  )
  const isViewMode = mode === "view"

  const isPending = isCreating || isUpdating
  const isEditMode = !!initialData && mode !== "create"

  const form = useForm<MasterSettingFormValues>({
    resolver: zodResolver(masterSettingSchema),
    defaultValues: initialData || {
      type: "COLOR",
      label: "",
      value: "",
      isActive: true,
    },
  })

  const onFormError = (errors: FieldErrors<MasterSettingFormValues>) => {
    console.error("MasterSetting form validation errors:", errors)
    toast.error("Please fill all required fields correctly.")
  }

  const handleCancel = () => {
    if (onSuccess) {
      onSuccess(initialData as MasterSetting)
    } else {
      router.push(MASTER_SETTINGS_BASE_HREF)
    }
  }

  function onSubmit(data: MasterSettingFormValues) {
    if (isEditMode && initialData) {
      updateMasterSetting(
        { id: initialData.id, data },
        {
          onSuccess: (updatedMasterSetting: MasterSetting) => {
            toast.success("Setting updated successfully")
            queryClient.invalidateQueries({ queryKey: ["master-settings"] })
            if (onSuccess) {
              onSuccess(updatedMasterSetting)
            } else {
              router.push(MASTER_SETTINGS_BASE_HREF)
            }
          },
          onError: (error) => {
            toast.error("Failed to update setting: " + error.message)
          },
        }
      )
    } else {
      createMasterSetting(data, {
        onSuccess: (newMasterSetting) => {
          toast.success("Setting created successfully")
          queryClient.invalidateQueries({ queryKey: ["master-settings"] })
          if (onSuccess) {
            onSuccess(newMasterSetting)
          } else {
            router.push(MASTER_SETTINGS_BASE_HREF)
          }
        },
        onError: (error) => {
          toast.error("Failed to create setting: " + error.message)
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
          <RadioGroupField
            control={form.control}
            name="type"
            label="Type"
            options={MASTER_SETTING_TYPE_OPTIONS.filter(o => o.value !== 'all')}
            required
            disabled={isViewMode}
          />
          <TextField control={form.control} name="label" label="Label" required readOnly={isViewMode} placeholder="e.g., Deep Purple" />
          <TextField control={form.control} name="value" label="Value" required readOnly={isViewMode} placeholder="e.g., deep_purple" />
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
            <Button variant="outline" type="button" onClick={handleCancel}>
              Close
            </Button>
          ) : (
            <>
              <Button variant="outline" type="button" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? "Save Changes" : "Save Setting"}
              </Button>
            </>
          )}
        </div>
      </form>
    </Form>
  )
}
