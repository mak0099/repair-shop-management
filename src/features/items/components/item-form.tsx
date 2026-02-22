"use client"

import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Info, Cpu, ClipboardCheck, Wallet } from "lucide-react"
import { toast } from "sonner"

import { TextField } from "@/components/forms/text-field"
import { TextareaField } from "@/components/forms/textarea-field"
import { CheckboxField } from "@/components/forms/checkbox-field"
import { RadioGroupField } from "@/components/forms/radio-group-field"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { itemSchema, ItemFormData } from "../item.schema"
import { useCreateItem } from "../item.api"

// Importing your specific combobox fields
import { CategoryComboboxField } from "@/features/categories/components/category-combobox-field"
import { BrandComboboxField } from "@/features/brands/components/brand-combobox-field"
import { ModelComboboxField } from "@/features/models/components/model-combobox-field"
import { SupplierComboboxField } from "@/features/suppliers/components/supplier-combobox-field"
import { BoxNumberComboboxField } from "@/features/box-numbers/components/box-number-combobox-field"
import { AttributeComboboxField } from "@/features/attributes/components/attribute-combobox-field"

export function ItemForm({ onSuccess }: { onSuccess?: () => void }) {
  const { mutate: createItem, isPending } = useCreateItem()

  const form = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      isTouchScreen: false,
      isSolidDevice: false,
      initialStock: 0,
      isActive: true,
      condition: "Used",
      isBoxIncluded: "No",
      isChargerIncluded: "No",
      addToKhata: "No"
    }
  })

  const { control, watch, handleSubmit } = form
  const imeiValue = watch("imei")
  const isSerialized = !!imeiValue

  const onSubmit = (data: ItemFormData) => {
    createItem(data as any, {
      onSuccess: () => {
        toast.success("Product saved successfully")
        onSuccess?.()
      }
    })
  }

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full bg-slate-50/50 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Column 1: Core Identity & Financials */}
              <div className="space-y-4">
                <Card className="shadow-sm border-t-2 border-t-blue-600">
                  <CardHeader className="py-2.5 px-4 border-b bg-white">
                    <CardTitle className="text-[11px] uppercase font-bold flex items-center gap-2 text-slate-700">
                      <Wallet className="h-4 w-4 text-blue-600" /> Identity & Finance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <TextField control={control} name="name" label="Product / Title" required inputClassName="h-9" />

                    <CategoryComboboxField control={control} name="categoryId" label="Device Category" required />

                    <div className="grid grid-cols-2 gap-3">
                      <BrandComboboxField control={control} name="brandId" label="Brand" required />
                      <ModelComboboxField control={control} name="modelId" label="Model" required />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <TextField control={control} name="deviceType" label="Device Type" inputClassName="h-9" />
                      <TextField control={control} name="sku" label="System SKU" readOnly inputClassName="h-9 bg-slate-100" />
                    </div>

                    <div className="grid grid-cols-2 gap-3 border-t pt-3">
                      <TextField control={control} name="purchasePrice" label="Purchase Price" type="number" required inputClassName="h-9" />
                      <TextField control={control} name="salePrice" label="Sale Price" type="number" required inputClassName="h-9" />
                    </div>

                    <SupplierComboboxField control={control} name="supplierId" label="Supplier" />
                  </CardContent>
                </Card>
              </div>

              {/* Column 2: Hardware Specifications */}
              <div className="space-y-4">
                <Card className="shadow-sm border-t-2 border-t-indigo-600">
                  <CardHeader className="py-2.5 px-4 border-b bg-white">
                    <CardTitle className="text-[11px] uppercase font-bold flex items-center gap-2 text-slate-700">
                      <Cpu className="h-4 w-4 text-indigo-600" /> Technical Specs
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <TextField control={control} name="imei" label="IMEI / Serial No" placeholder="Unique tracking ID" inputClassName="h-9 border-indigo-200" />

                    <div className="grid grid-cols-2 gap-3">
                      <AttributeComboboxField control={control} name="ram" attributeName="RAM" />
                      <AttributeComboboxField control={control} name="rom" attributeName="ROM" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <AttributeComboboxField control={control} name="color" attributeName="Color" />
                      <TextField control={control} name="processor" label="Processor" inputClassName="h-9" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <AttributeComboboxField control={control} name="grade" attributeName="Grade" label="Quality Grade" />
                      <TextField control={control} name="batteryHealth" label="Battery Health (%)" inputClassName="h-9" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <TextField control={control} name="camera" label="Camera" inputClassName="h-9" />
                      <TextField control={control} name="size" label="Screen Size" inputClassName="h-9" />
                    </div>
                    <TextareaField control={control} name="note" label="Technical Notes" className="min-h-[60px] text-xs" />
                  </CardContent>
                </Card>
              </div>

              {/* Column 3: Logistics & Condition */}
              <div className="space-y-4">
                <Card className="shadow-sm border-t-2 border-t-emerald-600">
                  <CardHeader className="py-2.5 px-4 border-b bg-white">
                    <CardTitle className="text-[11px] uppercase font-bold flex items-center gap-2 text-slate-700">
                      <ClipboardCheck className="h-4 w-4 text-emerald-600" /> Condition & Logistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="bg-slate-50 p-3 rounded-md border space-y-2">
                      <RadioGroupField control={control} name="condition" label="Product Condition" options={[{ label: "Used", value: "Used" }, { label: "New", value: "New" }]} />
                      <div className="grid grid-cols-2 gap-3">
                        <RadioGroupField control={control} name="isBoxIncluded" label="Box?" options={[{ label: "Yes", value: "Yes" }, { label: "No", value: "No" }]} />
                        <RadioGroupField control={control} name="isChargerIncluded" label="Charger?" options={[{ label: "Yes", value: "Yes" }, { label: "No", value: "No" }]} />
                      </div>
                      <CheckboxField control={control} name="isTouchScreen" label="Touch Screen" />
                      <CheckboxField control={control} name="isSolidDevice" label="Is Solid Device" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <BoxNumberComboboxField control={control} name="boxNumberId" label="Box Number" />
                      <TextField
                        control={control}
                        name="storageNote"
                        label="Storage Note"
                        placeholder="e.g. Home, Top shelf, or Side pocket"
                        inputClassName="h-9"
                      />
                    </div>

                    <div className="p-3 bg-amber-50 border border-amber-100 rounded-md">
                      <RadioGroupField control={control} name="addToKhata" label="Add to Khata?" options={[{ label: "Yes", value: "Yes" }, { label: "No", value: "No" }]} />
                    </div>

                    <div className="space-y-3 pt-2">
                      <TextareaField control={control} name="description" label="Web Description" className="min-h-[80px] text-xs" />
                      {!isSerialized && (
                        <TextField control={control} name="initialStock" label="Opening Stock Qty" type="number" inputClassName="h-9" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 flex justify-end gap-3 p-4 border-t bg-white shadow-lg">
            <Button variant="ghost" type="button" className="text-slate-500 font-bold" onClick={() => form.reset()}>RESET</Button>
            <Button type="submit" className="px-16 bg-slate-900 hover:bg-black text-white font-bold h-10" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              SAVE PRODUCT
            </Button>
          </div>
        </form>
      </Form>
    </FormProvider>
  )
}