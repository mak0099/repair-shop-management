"use client"

import { useEffect, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Edit3 } from "lucide-react"
import { toast } from "sonner"

import { TextField } from "@/components/forms/text-field"
import { TextareaField } from "@/components/forms/textarea-field"
import { CheckboxField } from "@/components/forms/checkbox-field"
import { RadioGroupField } from "@/components/forms/radio-group-field"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { FormFooter } from "@/components/forms/form-footer"

import { itemSchema, Item, ItemFormValues } from "../item.schema"
import { useCreateItem, useUpdateItem } from "../item.api"

import { CategorySelectField } from "@/features/categories"
import { BrandSelectField } from "@/features/brands"
import { ModelSelectField } from "@/features/models"
import { SupplierSelectField } from "@/features/suppliers"
import { BoxNumberSelectField } from "@/features/box-numbers"
import { AttributeSelectField } from "@/features/attributes"
import { MasterSettingSelectField } from "@/features/master-settings"

interface ItemFormProps {
  initialData?: Item
  onSuccess?: () => void
  isViewMode?: boolean
}

export function ItemForm({ initialData, onSuccess, isViewMode: initialIsViewMode = false }: ItemFormProps) {
  const { mutate: createItem, isPending: isCreating } = useCreateItem()
  const { mutate: updateItem, isPending: isUpdating } = useUpdateItem()

  const [mode, setMode] = useState<"view" | "edit" | "create">(
    initialIsViewMode ? "view" : initialData ? "edit" : "create"
  )
  const isViewMode = mode === "view"
  const isPending = isCreating || isUpdating

  /**
   * FIX: Using ItemFormValues (input type) for useForm.
   * This matches what the UI components (Radios) produce and what Zod expects to validate.
   */
  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: initialData?.name || "",
      purchasePrice: initialData?.purchasePrice || 0,
      salePrice: initialData?.salePrice || 0,
      initialStock: initialData?.initialStock || 1,
      isTouchScreen: initialData?.isTouchScreen ?? true,
      isSolidDevice: initialData?.isSolidDevice ?? false,
      isActive: initialData?.isActive ?? true,
      condition: initialData?.condition || "Used",
      // No more 'as any'. Using strings as per RadioGroup options.
      isBoxIncluded: initialData?.isBoxIncluded ? "true" : "false",
      isChargerIncluded: initialData?.isChargerIncluded ? "true" : "false",
      addToKhata: initialData?.addToKhata ? "true" : "false",
      ram: initialData?.ram || "",
      rom: initialData?.rom || "",
      color: initialData?.color || "",
      grade: initialData?.grade || "",
      categoryId: initialData?.categoryId || "",
      supplierId: initialData?.supplierId || "",
      brandId: initialData?.brandId || "",
      modelId: initialData?.modelId || "",
      deviceType: initialData?.deviceType || "",
      sku: initialData?.sku || "",
      imei: initialData?.imei || "",
      processor: initialData?.processor || "",
      batteryHealth: initialData?.batteryHealth || "",
      camera: initialData?.camera || "",
      size: initialData?.size || "",
      note: initialData?.note || "",
      boxNumberId: initialData?.boxNumberId || "",
      storageNote: initialData?.storageNote || "",
    }
  })

  const { control, watch, handleSubmit, setValue, formState } = form
  const imeiValue = watch("imei")
  const brandId = watch("brandId")
  const isSerialized = !!imeiValue

  useEffect(() => {
    if (formState.dirtyFields.brandId) {
      setValue("modelId", "")
    }
  }, [brandId, setValue, formState.dirtyFields.brandId])

  const onSubmit = (data: ItemFormValues) => {
    const callbacks = {
      onSuccess: () => {
        toast.success(`Product ${initialData ? "updated" : "saved"} successfully`)
        onSuccess?.()
      },
      onError: (err: Error) => toast.error(err.message)
    }

    /**
     * Zod Resolver will automatically transform "true"/"false" strings into booleans
     * so 'data' here is correctly typed as 'Item' at runtime.
     */
    if (initialData?.id) {
      updateItem({ id: initialData.id, data: data as Item }, callbacks)
    } else {
      createItem(data as Item, callbacks)
    }
  }

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full bg-slate-50/30">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Section 1: Basic Information & Pricing */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit relative">
                {isViewMode && (
                  <div className="absolute top-4 right-4 z-10">
                    <Button size="sm" variant="outline" type="button" onClick={() => setMode("edit")}>
                      <Edit3 className="mr-2 h-3.5 w-3.5" /> Edit
                    </Button>
                  </div>
                )}
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-1.5 h-5 bg-blue-600 rounded-full" />
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Basic Information & Pricing</h3>
                </div>
                <div className="space-y-5">
                  <TextField control={control} name="name" label="Product Title" required placeholder="iPhone 15 Pro Max..." readOnly={isViewMode} />

                  <div className="grid grid-cols-2 gap-4">
                    <CategorySelectField control={control} name="categoryId" label="Category" required readOnly={isViewMode} />
                    <SupplierSelectField control={control} name="supplierId" label="Supplier" readOnly={isViewMode} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <BrandSelectField control={control} name="brandId" label="Brand" required readOnly={isViewMode} />
                    <ModelSelectField
                      control={control}
                      name="modelId"
                      label="Model"
                      required
                      brandId={brandId}
                      disabled={!brandId || isViewMode}
                      readOnly={isViewMode}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-50">
                    <TextField control={control} name="purchasePrice" label="Purchase Price" type="number" required readOnly={isViewMode} />
                    <TextField control={control} name="salePrice" label="Selling Price" type="number" required readOnly={isViewMode} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <MasterSettingSelectField type="DEVICE_TYPE" control={control} name="deviceType" label="Device Type" readOnly={isViewMode} />
                    <TextField control={control} name="sku" label="System SKU" readOnly inputClassName="bg-slate-50 text-slate-400 border-dashed" />
                  </div>
                </div>
              </div>

              {/* Section 2: Technical Specifications */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-1.5 h-5 bg-indigo-600 rounded-full" />
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Technical Specs</h3>
                </div>

                <div className="space-y-5">
                  <TextField control={control} name="imei" label="IMEI / Serial" placeholder="Scan device..." readOnly={isViewMode} />

                  <div className="grid grid-cols-2 gap-4">
                    <AttributeSelectField control={control} name="ram" attributeKey="RAM" label="RAM" readOnly={isViewMode} />
                    <AttributeSelectField control={control} name="rom" attributeKey="ROM" label="Storage" readOnly={isViewMode} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <AttributeSelectField control={control} name="color" attributeKey="COLOR" label="Color" readOnly={isViewMode} />
                    <AttributeSelectField control={control} name="grade" attributeKey="GRADE" label="Quality Grade" readOnly={isViewMode} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <TextField control={control} name="processor" label="Processor" readOnly={isViewMode} />
                    <TextField control={control} name="batteryHealth" label="Battery %" placeholder="Ex: 95" readOnly={isViewMode} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <TextField control={control} name="camera" label="Camera Details" readOnly={isViewMode} />
                    <TextField control={control} name="size" label="Screen Size" readOnly={isViewMode} />
                  </div>

                  <TextareaField control={control} name="note" label="Internal Technical Note" rows={2} readOnly={isViewMode} />
                </div>
              </div>
            </div>

            {/* Section 3: Inventory & Condition */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-5 bg-emerald-600 rounded-full" />
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Inventory & Fulfillment</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-5 p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <RadioGroupField layout="horizontal" control={control} name="condition" label="Item Condition" options={[{ label: "Used", value: "Used" }, { label: "New", value: "New" }]} readOnly={isViewMode} />
                  <RadioGroupField layout="horizontal" control={control} name="isBoxIncluded" label="Box?" options={[{ label: "Yes", value: "true" }, { label: "No", value: "false" }]} readOnly={isViewMode} />
                  <RadioGroupField layout="horizontal" control={control} name="isChargerIncluded" label="Charger?" options={[{ label: "Yes", value: "true" }, { label: "No", value: "false" }]} readOnly={isViewMode} />

                  <div className="flex flex-wrap gap-6 pt-2 border-t border-slate-200/60 mt-2">
                    <CheckboxField control={control} name="isTouchScreen" label="Touchscreen" disabled={isViewMode} />
                    <CheckboxField control={control} name="isSolidDevice" label="Solid Device" disabled={isViewMode} />
                    <CheckboxField control={control} name="isActive" label="Active (Show in POS)" disabled={isViewMode} />
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <BoxNumberSelectField control={control} name="boxNumberId" label="Storage Box" readOnly={isViewMode} />
                    {!isSerialized && (
                      <TextField control={control} name="initialStock" label="Opening Quantity" type="number" readOnly={isViewMode} />
                    )}
                  </div>
                  <TextField control={control} name="storageNote" label="Storage Note" placeholder="Top shelf..." readOnly={isViewMode} />


                  <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100">
                    <RadioGroupField layout="horizontal" control={control} name="addToKhata" label="Add to Credit Khata?" options={[{ label: "Yes", value: "true" }, { label: "No", value: "false" }]} readOnly={isViewMode} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <FormFooter
            isViewMode={isViewMode}
            isEditMode={!!initialData}
            isPending={isPending}
            onCancel={() => onSuccess?.()}
            onEdit={() => setMode("edit")}
            onReset={() => form.reset()}
            saveLabel={initialData ? "Update Product" : "Confirm & Save"}
            className="p-6 bg-white shadow-lg"
          />
        </form>
      </Form>
    </FormProvider>
  )
}