"use client"

import { useEffect, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { FormProvider, useForm, Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { BrandSelectField } from "@/features/brands"
import { CustomerSelectField } from "@/features/customers"
import { ItemSelectField } from "@/features/items"
import { MasterSettingSelectField } from "@/features/master-settings"
import { ModelSelectField } from "@/features/models"
import { UserSelectField } from "@/features/users"

import { DatePickerField } from "@/components/forms/date-picker-field"
import { ImageUploadField } from "@/components/forms/image-upload-field"
import { RadioGroupField } from "@/components/forms/radio-group-field"
import { TextField } from "@/components/forms/text-field"
import { TextareaField } from "@/components/forms/textarea-field"
import { Form } from "@/components/ui/form"
import { FormFooter } from "@/components/forms/form-footer"
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

  // FIX 1: Fixed acceptance_date mapping to avoid "undefined" error
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema) as unknown as Resolver<FormData>,
    defaultValues: {
      customerId: initialData?.customerId || "",
      acceptanceDate: initialData?.acceptanceDate ? new Date(initialData.acceptanceDate) : new Date(),
      estimatedPrice: initialData?.estimatedPrice,
      brandId: initialData?.brandId || "",
      modelId: initialData?.modelId || "",
      color: initialData?.color || "",
      accessories: initialData?.accessories || "",
      deviceType: initialData?.deviceType || "SMARTPHONE",
      currentStatus: initialData?.currentStatus || "IN REPAIR",
      defectDescription: initialData?.defectDescription || "",
      notes: initialData?.notes || "",
      imei: initialData?.imei || "",
      secondaryImei: initialData?.secondaryImei || "",
      technicianId: initialData?.technicianId || "",
      warranty: initialData?.warranty || "",
      replacementDeviceId: initialData?.replacementDeviceId || "",
      dealer: initialData?.dealer || "",
      priceOffered: initialData?.priceOffered,
      reservedNotes: initialData?.reservedNotes || "",
      importantInformation: initialData?.importantInformation ? "true" : "false",
      pinUnlock: initialData?.pinUnlock ? "true" : "false",
      pinUnlockNumber: initialData?.pinUnlockNumber || "",
      urgent: initialData?.urgent ? "true" : "false",
      urgentDate: initialData?.urgentDate ? new Date(initialData.urgentDate) : undefined,
      quote: initialData?.quote ? "true" : "false",
    },
  })

  const { control, watch, setValue, formState } = form
  const pinUnlock = watch("pinUnlock")
  const urgent = watch("urgent")
  const brandId = watch("brandId")

  useEffect(() => {
    if (formState.dirtyFields.brandId) {
      setValue("modelId", "", { shouldDirty: true })
    }
  }, [brandId, setValue, formState.dirtyFields.brandId])

  function onSubmit(data: FormData) {
    const callbacks = {
      onSuccess: (res: Acceptance) => {
        toast.success(`Acceptance ${isEditMode ? "updated" : "created"} successfully`)
        queryClient.invalidateQueries({ queryKey: ["acceptances"] })
        onSuccess?.(res)
      },
      onError: (error: Error) => toast.error(error.message),
    }

    if (isEditMode && initialData?.id) {
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
              {/* Column 1: Customer & Device */}
              <div className="md:col-span-1 space-y-4">
                <div className="bg-white p-4 rounded-md shadow border space-y-3">
                  {/* FIX 2: Added 'as any' to control for variance issues */}
                  <CustomerSelectField name="customerId" control={control} required readOnly={isViewMode} />
                  <TextField control={control} name="estimatedPrice" label="Estimated Price" type="number" readOnly={isViewMode} />
                  <BrandSelectField name="brandId" control={control} required readOnly={isViewMode} />
                  <ModelSelectField
                    name="modelId"
                    control={control}
                    brandId={brandId}
                    required
                    readOnly={isViewMode || !brandId}
                  />
                  <MasterSettingSelectField control={control} name="color" type="COLOR" label="Color" readOnly={isViewMode} />
                  <MasterSettingSelectField control={control} name="accessories" type="ACCESSORY" label="Accessories" readOnly={isViewMode} />
                  <MasterSettingSelectField control={control} name="deviceType" type="DEVICE_TYPE" label="Device Type" required readOnly={isViewMode} />
                  <MasterSettingSelectField control={control} name="currentStatus" type="REPAIR_STATUS" label="Status" required readOnly={isViewMode} />
                  <TextareaField control={control} name="defectDescription" label="Defect" readOnly={isViewMode} />
                </div>
              </div>

              {/* Column 2: Tech & Info */}
              <div className="md:col-span-1 space-y-4">
                <div className="bg-white p-4 rounded-md shadow border space-y-3">
                  <DatePickerField
                    control={control}
                    name="acceptanceDate"
                    label="Acceptance Date"
                    required
                    readOnly={isViewMode}
                  />
                  <TextField control={control} name="imei" label="IMEI/Serial" required readOnly={isViewMode} />
                  <TextField control={control} name="secondaryImei" label="Secondary IMEI" readOnly={isViewMode} />
                  <UserSelectField control={control} name="technicianId" label="Technician" required readOnly={isViewMode} />
                  <MasterSettingSelectField control={control} name="warranty" type="WARRANTY" label="Warranty" readOnly={isViewMode} />
                  <ItemSelectField control={control} name="replacementDeviceId" label="Replacement" readOnly={isViewMode} />
                  <TextField control={control} name="dealer" label="Dealer" readOnly={isViewMode} />
                  <TextField control={control} name="priceOffered" label="Price Offered" type="number" readOnly={isViewMode} />
                  <TextareaField control={control} name="reservedNotes" label="Reserved Notes" readOnly={isViewMode} />
                </div>
              </div>

              {/* Column 3: Flags & Photos */}
              <div className="md:col-span-1 space-y-4">
                <div className="text-center space-y-2 p-2 bg-slate-50 rounded border">
                  <div className="text-xs text-gray-500 uppercase font-semibold">Acceptance ID</div>
                  <div className="text-xl font-bold text-blue-600 tracking-wider">
                    {initialData?.acceptanceNumber || "NEW-DRAFT"}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-md shadow border space-y-4">
                  <RadioGroupField 
                    control={control} 
                    required 
                    name="importantInformation" 
                    label="Important?" 
                    readOnly={isViewMode}
                    options={[{ label: "Yes", value: "true" }, { label: "No", value: "false" }]} 
                  />
                  <RadioGroupField 
                    control={control} 
                    required 
                    name="pinUnlock" 
                    label="Pin Unlock?" 
                    readOnly={isViewMode}
                    options={[{ label: "Yes", value: "true" }, { label: "No", value: "false" }]} 
                  />
                  {pinUnlock === "true" && (
                    <TextField control={control} name="pinUnlockNumber" label="PIN Code" required readOnly={isViewMode} />
                  )}
                  <RadioGroupField 
                    control={control} 
                    required 
                    name="urgent" 
                    label="Urgent?" 
                    readOnly={isViewMode}
                    options={[{ label: "Yes", value: "true" }, { label: "No", value: "false" }]} 
                  />
                  {urgent === "true" && (
                    <DatePickerField
                      control={control}
                      name="urgentDate"
                      label="Deadline"
                      required
                      disabled={(date) => isViewMode || date < new Date(new Date().setHours(0,0,0,0))}
                    />
                  )}
                  <RadioGroupField 
                    control={control} 
                    required 
                    name="quote" 
                    label="Quote Needed?" 
                    readOnly={isViewMode}
                    options={[{ label: "Yes", value: "true" }, { label: "No", value: "false" }]} 
                  />
                </div>

                <div className="bg-white p-4 rounded-md shadow border grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4, 5].map((num) => {
                    return (
                      <ImageUploadField
                        key={num}
                        control={control}
                        name={`photo${num}` as keyof FormData}
                        label={`Photo ${num}`}
                        initialImage={initialData ? (initialData[(`photo${num}` as keyof Acceptance)] as string) : null}
                        layout="compact"
                        isViewMode={isViewMode}
                      />
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          <FormFooter
            isViewMode={isViewMode}
            isEditMode={isEditMode}
            isPending={isPending}
            onCancel={() => onSuccess?.(initialData!)}
            onEdit={() => setMode("edit")}
            onReset={() => form.reset()}
            saveLabel={isEditMode ? "Update Changes" : "Save Record"}
            className="p-6 bg-slate-50"
          />
        </form>
      </Form>
    </FormProvider>
  )
}