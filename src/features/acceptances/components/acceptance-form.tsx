"use client"

import { useState } from "react"
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

import { ComboboxWithAdd } from "@/components/forms/combobox-with-add-field"
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

  // Logic from StatusFields
  const [photoPreviews, setPhotoPreviews] = useState<{ [key: string]: string }>({})

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues:
      initialData ||
      {
        customer_id: "",
        created_date: new Date(),
        estimated_price: undefined,
        brand_id: "",
        model_id: "",
        color: "",
        accessories: "",
        device_type: "SMARTPHONE",
        current_status: "IN REPAIR",
        defect_description: "",
        notes: "",
        imei: "",
        secondary_imei: "",
        technician_id: "",
        warranty: "",
        replacement_device_id: "",
        dealer: "",
        price_offered: undefined,
        reserved_notes: "",
        important_information: "No",
        pin_unlock: "No",
        pin_unlock_number: "",
        urgent: "No",
        quote: "No",
      },
  })

  const { control, watch, setValue } = form
  const pinUnlock = watch("pin_unlock")
  const urgent = watch("urgent")

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
    if (isEditMode && initialData) {
      updateAcceptance(
        { id: initialData.id, data },
        {
          onSuccess: (updatedAcceptance) => {
            toast.success("Acceptance updated successfully")
            queryClient.invalidateQueries({ queryKey: ["acceptances"] })
            onSuccess?.(updatedAcceptance)
          },
          onError: (error) => {
            toast.error("Failed to update acceptance: " + error.message)
          },
        }
      )
    } else {
      createAcceptance(data, {
        onSuccess: (newAcceptance) => {
          toast.success("Acceptance created successfully")
          queryClient.invalidateQueries({ queryKey: ["acceptances"] })
          onSuccess?.(newAcceptance)
        },
        onError: (error) => {
          toast.error("Failed to create acceptance: " + error.message)
        },
      })
    }
  }

  const handleCancel = () => {
    if (onSuccess) {
      onSuccess(initialData as Acceptance)
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
                  <Button size="sm" type="button" onClick={() => setMode("edit")}>
                    Edit
                  </Button>
                </div>
              )}
              {/* Column 1: Customer & Device Fields */}
              <div className="md:col-span-1 space-y-4">
                <div className="bg-white p-4 rounded-md shadow border space-y-3">
                  <CustomerComboboxField name="customer_id" control={control} required />
                  <TextField
                    control={control}
                    name="estimated_price"
                    label="Estimated Price"
                    type="number"
                    placeholder="Enter the estimated price"
                    inputClassName="h-10"
                    readOnly={isViewMode}
                  />
                  <BrandComboboxField name="brand_id" control={control} required disabled={isViewMode} />
                  <ModelComboboxField name="model_id" control={control} required disabled={isViewMode} />
                  <MasterSettingComboboxField
                    control={control}
                    name="color"
                    type="COLOR"
                    label="Color"
                    placeholder="Select Color"
                    disabled={isViewMode}
                  />
                  <MasterSettingComboboxField
                    control={control}
                    name="accessories"
                    type="ACCESSORY"
                    label="Accessories"
                    placeholder="Select accessories"
                    disabled={isViewMode}
                  />
                  <MasterSettingComboboxField
                    control={control}
                    name="device_type"
                    type="DEVICE_TYPE"
                    label="Device Type"
                    placeholder="Select device type"
                    required
                    disabled={isViewMode}
                  />
                  <MasterSettingComboboxField
                    control={control}
                    name="current_status"
                    type="REPAIR_STATUS"
                    label="Current Status"
                    placeholder="Select status"
                    required
                    disabled={isViewMode}
                  />
                  <TextareaField
                    control={control}
                    name="defect_description"
                    label="Defect Description"
                    placeholder="Describe the defect presented by the device"
                    readOnly={isViewMode}
                  />
                  <TextareaField
                    control={control}
                    name="notes"
                    label="Notes"
                    placeholder="Enter the condition of the device"
                    readOnly={isViewMode}
                  />
                </div>
              </div>

              {/* Column 2: Technical & Financial Fields */}
              <div className="md:col-span-1 space-y-4">
                <div className="bg-white p-4 rounded-md shadow border space-y-3">
                  <DatePickerField
                    control={control}
                    name="created_date"
                    label="Created Date"
                    required
                    disabled={(date: Date) =>
                      isViewMode || date > new Date() || date < new Date("1900-01-01")
                    }
                  />
                  <TextField
                    control={control}
                    name="imei"
                    label="IMEI/Serial No"
                    placeholder="Enter IMEI"
                    required
                    readOnly={isViewMode}
                  />
                  <TextField
                    control={control}
                    name="secondary_imei"
                    label="Secondary IMEI"
                    placeholder="Enter secondary IMEI"
                    readOnly={isViewMode}
                  />
                  <UserComboboxField
                    control={control}
                    name="technician_id"
                    label="Technician"
                    placeholder="Select technician"
                    required
                    disabled={isViewMode}
                  />
                  <MasterSettingComboboxField
                    control={control}
                    name="warranty"
                    type="WARRANTY"
                    label="Warranty"
                    placeholder="Choose an option"
                    disabled={isViewMode}
                  />
                  <ItemComboboxField
                    control={control}
                    name="replacement_device_id"
                    label="Replacement Device"
                    placeholder="Select replacement device"
                    disabled={isViewMode}
                  />
                  <TextField
                    control={control}
                    name="dealer"
                    label="Dealer"
                    placeholder="For B2B partner reference"
                    readOnly={isViewMode}
                  />
                  <TextField
                    control={control}
                    name="price_offered"
                    label="Price Offered"
                    type="number"
                    placeholder="XXXXX"
                    readOnly={isViewMode}
                  />
                  <TextareaField
                    control={control}
                    name="reserved_notes"
                    label="Reserved Notes"
                    placeholder="Enter reserved notes"
                    readOnly={isViewMode}
                  />
                </div>
              </div>

              {/* Column 3: Status & Photo Fields */}
              <div className="md:col-span-1 space-y-4">
                <div className="text-center space-y-2">
                  <div className="text-sm font-medium text-gray-500">Acceptance Number</div>
                  <div className="bg-blue-500 text-white text-2xl font-bold py-2 px-6 rounded-full inline-block">41604-2025</div>
                  <div className="text-sm text-gray-500">Total Mail Sent: 0</div>
                </div>
                <div className="bg-white p-4 rounded-md shadow border space-y-3">
                  <RadioGroupField
                    control={control}
                    required
                    name="important_information"
                    label="Important Information"
                    disabled={isViewMode}
                  />
                  <RadioGroupField control={control} required name="pin_unlock" label="Pin Unlock" disabled={isViewMode} />
                  {pinUnlock === "Yes" && (
                    <TextField
                      control={control}
                      name="pin_unlock_number"
                      label="Pin Unlock Number"
                      placeholder="Enter pin unlock number"
                      required
                      readOnly={isViewMode}
                    />
                  )}
                  <RadioGroupField control={control} required name="urgent" label="Urgent" />
                  {urgent === "Yes" && (
                    <DatePickerField
                      control={control}
                      name="urgent_date"
                      label="Urgent Date"
                      required
                      disabled={(date) =>
                        isViewMode || date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                    />
                  )}
                  <RadioGroupField control={control} required name="quote" label="Quote" disabled={isViewMode} />
                </div>
                <div className="bg-white p-4 rounded-md shadow border">
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4, 5].map((num) => {
                      const fieldName = `photo_${num}`
                      const preview = photoPreviews[fieldName]

                      return (
                        <div key={num} className="space-y-2">
                          <Label htmlFor={`photo-${num}`} className="text-xs">
                            Photo {num}
                          </Label>
                          <div className="relative">
                            {preview ? (
                              <div className="relative">
                                <Image
                                  src={preview}
                                  alt={`Photo ${num}`}
                                  width={96}
                                  height={96}
                                  className="w-full h-24 object-cover rounded-md border"
                                />
                                {!isViewMode && (
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="absolute -top-2 -right-2 h-6 w-6 p-0"
                                    onClick={() => removePhoto(fieldName)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            ) : (
                              <div className="w-full h-24 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center">
                                {isViewMode ? (
                                  <span className="text-xs text-muted-foreground">No Photo</span>
                                ) : (
                                  <label htmlFor={`photo-${num}`} className="cursor-pointer">
                                    <Upload className="h-8 w-8 text-gray-400" />
                                    <input
                                      id={`photo-${num}`}
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => handlePhotoUpload(fieldName, e.target.files?.[0] || null)}
                                    />
                                  </label>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0 flex justify-end gap-2 p-6 border-t bg-background">
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
                  {isEditMode ? "Save Changes" : "Save Acceptance"}
                </Button>
              </>
            )}
          </div>
        </form>
      </Form>
    </FormProvider>
  )
}