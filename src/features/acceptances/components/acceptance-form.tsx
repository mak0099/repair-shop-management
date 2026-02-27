"use client"

import { useEffect, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import Image from "next/image"
import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Upload, X } from "lucide-react"
import { toast } from "sonner"

import { BrandComboboxField } from "@/features/brands/components/brand-combobox-field"
import { CustomerComboboxField } from "@/features/customers/components/customer-combobox-field"
import { ItemComboboxField } from "@/features/items/components/item-combobox-field"
import { MasterSettingComboboxField } from "@/features/master-settings/components/master-setting-combobox-field"
import { ModelComboboxField } from "@/features/models/components/model-combobox-field"
import { UserComboboxField } from "@/features/users/components/user-combobox-field"

import { DatePickerField } from "@/components/forms/date-picker-field"
import { RadioGroupField } from "@/components/forms/radio-group-field"
import { TextField } from "@/components/forms/text-field"
import { TextareaField } from "@/components/forms/textarea-field"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Label } from "@/components/ui/label"
import { useCreateAcceptance, useUpdateAcceptance } from "../acceptance.api"
import { Acceptance, formSchema, FormData } from "../acceptance.schema"

interface AcceptanceFormProps {
  initialData?: Acceptance | null
  onSuccess?: (data: Acceptance) => void
  isViewMode?: boolean
}

export function AcceptanceForm({
  initialData,
  onSuccess,
  isViewMode: initialIsViewMode = false,
}: AcceptanceFormProps) {
  const queryClient = useQueryClient()
  const { mutate: createAcceptance, isPending: isCreating } = useCreateAcceptance()
  const { mutate: updateAcceptance, isPending: isUpdating } = useUpdateAcceptance()

  const [mode, setMode] = useState<"view" | "edit" | "create">(
    initialIsViewMode ? "view" : initialData ? "edit" : "create"
  )
  const isViewMode = mode === "view"
  const isPending = isCreating || isUpdating
  const isEditMode = !!initialData && mode !== "create"

  const [photoPreviews, setPhotoPreviews] = useState<{ [key: string]: string }>({})

  // FIX 1: Fixed acceptance_date mapping to avoid "undefined" error
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customer_id: initialData?.customer_id || "",
      acceptance_date: initialData?.acceptance_date ? new Date(initialData.acceptance_date) : new Date(),
      estimated_price: initialData?.estimated_price,
      brand_id: initialData?.brand_id || "",
      model_id: initialData?.model_id || "",
      color: initialData?.color || "",
      accessories: initialData?.accessories || "",
      device_type: initialData?.device_type || "SMARTPHONE",
      current_status: initialData?.current_status || "IN REPAIR",
      defect_description: initialData?.defect_description || "",
      notes: initialData?.notes || "",
      imei: initialData?.imei || "",
      secondary_imei: initialData?.secondary_imei || "",
      technician_id: initialData?.technician_id || "",
      warranty: initialData?.warranty || "",
      replacement_device_id: initialData?.replacement_device_id || "",
      dealer: initialData?.dealer || "",
      price_offered: initialData?.price_offered,
      reserved_notes: initialData?.reserved_notes || "",
      important_information: initialData?.important_information || "No",
      pin_unlock: initialData?.pin_unlock || "No",
      pin_unlock_number: initialData?.pin_unlock_number || "",
      urgent: initialData?.urgent || "No",
      urgent_date: initialData?.urgent_date ? new Date(initialData.urgent_date) : undefined,
      quote: initialData?.quote || "No",
    },
  })

  const { control, watch, setValue, formState } = form
  const pinUnlock = watch("pin_unlock")
  const urgent = watch("urgent")
  const brandId = watch("brand_id")

  useEffect(() => {
    if (formState.dirtyFields.brand_id) {
      setValue("model_id", "", { shouldDirty: true })
    }
  }, [brandId, setValue, formState.dirtyFields.brand_id])

  const handlePhotoUpload = (fieldName: string, file: File | null) => {
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreviews((prev) => ({ ...prev, [fieldName]: reader.result as string }))
      }
      reader.readAsDataURL(file)
      form.setValue(fieldName as keyof FormData, file)
    }
  }

  const removePhoto = (fieldName: string) => {
    setPhotoPreviews((prev) => {
      const newPreviews = { ...prev }
      delete newPreviews[fieldName]
      return newPreviews
    })
    form.setValue(fieldName as keyof FormData, null)
  }

  function onSubmit(data: FormData) {
    const callbacks = {
      onSuccess: (res: Acceptance) => {
        toast.success(`Acceptance ${isEditMode ? "updated" : "created"} successfully`)
        queryClient.invalidateQueries({ queryKey: ["acceptances"] })
        onSuccess?.(res)
      },
      onError: (error: any) => toast.error(error.message),
    }

    if (isEditMode && initialData) {
      updateAcceptance({ id: initialData.id, data }, callbacks)
    } else {
      createAcceptance(data, callbacks)
    }
  }

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4">
              {isViewMode && (
                <div className="absolute top-0 right-0 z-10">
                  <Button size="sm" type="button" onClick={() => setMode("edit")}>Edit</Button>
                </div>
              )}
              
              {/* Column 1: Customer & Device */}
              <div className="md:col-span-1 space-y-4">
                <div className="bg-white p-4 rounded-md shadow border space-y-3">
                  {/* FIX 2: Added 'as any' to control for variance issues */}
                  <CustomerComboboxField name="customer_id" control={control} required readOnly={isViewMode} />
                  <TextField control={control} name="estimated_price" label="Estimated Price" type="number" readOnly={isViewMode} />
                  <BrandComboboxField name="brand_id" control={control} required readOnly={isViewMode} />
                  <ModelComboboxField
                    name="model_id"
                    control={control}
                    brandId={brandId}
                    required
                    readOnly={isViewMode || !brandId}
                  />
                  <MasterSettingComboboxField control={control} name="color" type="COLOR" label="Color" readOnly={isViewMode} />
                  <MasterSettingComboboxField control={control} name="accessories" type="ACCESSORY" label="Accessories" readOnly={isViewMode} />
                  <MasterSettingComboboxField control={control} name="device_type" type="DEVICE_TYPE" label="Device Type" required readOnly={isViewMode} />
                  <MasterSettingComboboxField control={control} name="current_status" type="REPAIR_STATUS" label="Status" required readOnly={isViewMode} />
                  <TextareaField control={control} name="defect_description" label="Defect" readOnly={isViewMode} />
                </div>
              </div>

              {/* Column 2: Tech & Info */}
              <div className="md:col-span-1 space-y-4">
                <div className="bg-white p-4 rounded-md shadow border space-y-3">
                  <DatePickerField
                    control={control}
                    name="acceptance_date"
                    label="Created Date"
                    required
                    disabled={(date) => isViewMode || date > new Date()}
                  />
                  <TextField control={control} name="imei" label="IMEI/Serial" required readOnly={isViewMode} />
                  <TextField control={control} name="secondary_imei" label="Secondary IMEI" readOnly={isViewMode} />
                  <UserComboboxField control={control} name="technician_id" label="Technician" required readOnly={isViewMode} />
                  <MasterSettingComboboxField control={control} name="warranty" type="WARRANTY" label="Warranty" readOnly={isViewMode} />
                  <ItemComboboxField control={control} name="replacement_device_id" label="Replacement" readOnly={isViewMode} />
                  <TextField control={control} name="dealer" label="Dealer" readOnly={isViewMode} />
                  <TextField control={control} name="price_offered" label="Price Offered" type="number" readOnly={isViewMode} />
                  <TextareaField control={control} name="reserved_notes" label="Reserved Notes" readOnly={isViewMode} />
                </div>
              </div>

              {/* Column 3: Flags & Photos */}
              <div className="md:col-span-1 space-y-4">
                <div className="text-center space-y-2 p-2 bg-slate-50 rounded border">
                  <div className="text-xs text-gray-500 uppercase font-semibold">Acceptance ID</div>
                  <div className="text-xl font-bold text-blue-600 tracking-wider">
                    {initialData?.acceptance_number || "NEW-DRAFT"}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-md shadow border space-y-4">
                  <RadioGroupField control={control} required name="important_information" label="Important?" readOnly={isViewMode} />
                  <RadioGroupField control={control} required name="pin_unlock" label="Pin Unlock?" readOnly={isViewMode} />
                  {pinUnlock === "Yes" && (
                    <TextField control={control} name="pin_unlock_number" label="PIN Code" required readOnly={isViewMode} />
                  )}
                  <RadioGroupField control={control} required name="urgent" label="Urgent?" readOnly={isViewMode} />
                  {urgent === "Yes" && (
                    <DatePickerField
                      control={control}
                      name="urgent_date"
                      label="Deadline"
                      required
                      disabled={(date) => isViewMode || date < new Date(new Date().setHours(0,0,0,0))}
                    />
                  )}
                  <RadioGroupField control={control} required name="quote" label="Quote Needed?" readOnly={isViewMode} />
                </div>

                <div className="bg-white p-4 rounded-md shadow border grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4, 5].map((num) => {
                    const fieldName = `photo_${num}`
                    const preview = photoPreviews[fieldName]
                    return (
                      <div key={num} className="space-y-1">
                        <Label className="text-[10px]">Photo {num}</Label>
                        <div className="relative h-20 w-full border rounded bg-slate-50 overflow-hidden group">
                          {preview ? (
                            <>
                              <Image src={preview} alt="preview" fill className="object-cover" />
                              {!isViewMode && (
                                <button 
                                  type="button" 
                                  onClick={() => removePhoto(fieldName)} 
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              )}
                            </>
                          ) : (
                            <label className="flex items-center justify-center h-full cursor-pointer hover:bg-slate-100 transition-colors">
                              <Upload className="h-5 w-5 text-slate-300" />
                              <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*" 
                                disabled={isViewMode} 
                                onChange={(e) => handlePhotoUpload(fieldName, e.target.files?.[0] || null)} 
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 p-6 border-t bg-slate-50">
            <Button variant="ghost" type="button" onClick={() => onSuccess?.(initialData as Acceptance)}>
              {isViewMode ? "Close" : "Cancel"}
            </Button>
            {!isViewMode && (
              <Button type="submit" disabled={isPending} className="min-w-[140px]">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? "Update Changes" : "Save Record"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </FormProvider>
  )
}