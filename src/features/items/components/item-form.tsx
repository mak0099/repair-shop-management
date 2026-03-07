"use client"

import { useEffect, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Edit3, Plus, X, Smartphone, Package, Info, LayoutGrid, Settings2 } from "lucide-react"
import { toast } from "sonner"

import { TextField } from "@/components/forms/text-field"
import { TextareaField } from "@/components/forms/textarea-field"
import { CheckboxField } from "@/components/forms/checkbox-field"
import { RadioGroupField } from "@/components/forms/radio-group-field"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { FormFooter } from "@/components/forms/form-footer"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

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

// Helper to generate a temporary SKU for new items
const generateSKU = () => `SKU-${Math.floor(100000 + Math.random() * 900000)}`

export function ItemForm({ initialData, onSuccess, isViewMode: initialIsViewMode = false }: ItemFormProps) {
  const { mutate: createItem, isPending: isCreating } = useCreateItem()
  const { mutate: updateItem, isPending: isUpdating } = useUpdateItem()

  const [mode, setMode] = useState<"view" | "edit" | "create">(
    initialIsViewMode ? "view" : initialData ? "edit" : "create"
  )
  const isViewMode = mode === "view"
  const isPending = isCreating || isUpdating

  const [currentSerial, setCurrentSerial] = useState("")
  const [serialList, setSerialList] = useState<string[]>([])

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: initialData ? {
      ...initialData,
      isSerialized: initialData.isSerialized ? "true" : "false",
      isBoxIncluded: initialData.isBoxIncluded ? "true" : "false",
      isChargerIncluded: initialData.isChargerIncluded ? "true" : "false",
      addToKhata: initialData.addToKhata ? "true" : "false",
    } : {
      name: "",
      purchasePrice: 0,
      salePrice: 0,
      initialStock: 0, // ডিফল্ট ০ করা হয়েছে
      minStockLevel: 2, // স্কিমা অনুযায়ী সঠিক নাম
      isTouchScreen: true,
      isSolidDevice: false,
      isActive: true,
      condition: "Used",
      isSerialized: "false",
      isBoxIncluded: "true",
      isChargerIncluded: "true",
      addToKhata: "true",
      ram: "",
      rom: "",
      color: "",
      grade: "",
      categoryId: "",
      supplierId: "",
      brandId: "",
      modelId: "",
      deviceType: "",
      sku: generateSKU(), // Auto-generate SKU to satisfy validation
      imei: "",
      processor: "",
      batteryHealth: "",
      camera: "",
      size: "",
      description: "",
      note: "",
      boxNumberId: "",
      storageNote: "",
    }
  })

  const { control, watch, handleSubmit, setValue, formState } = form
  const brandId = watch("brandId")
  const isSerialized = watch("isSerialized") === "true"

  // ১. ডাটা ক্লিনিং এবং কোয়ান্টিটি সিঙ্ক
  useEffect(() => {
    if (!isSerialized) {
      setSerialList([])
      setValue("imei", "")
    } else {
      setValue("initialStock", serialList.length)
    }
  }, [isSerialized, setValue, serialList.length])

  // ২. ইনভেন্টরি থেকে সিরিয়াল লিস্ট পপুলেট
  useEffect(() => {
    if (initialData?.imei && initialData?.isSerialized) {
      const existingSerials = initialData.imei.split(",").map(s => s.trim()).filter(Boolean)
      setSerialList(existingSerials)
    }
  }, [initialData])

  const addSerial = () => {
    const trimmed = currentSerial.trim()
    if (!trimmed) return
    if (serialList.includes(trimmed)) {
      toast.error("Serial/IMEI already exists")
      return
    }
    const newList = [...serialList, trimmed]
    setSerialList(newList)
    setCurrentSerial("")
    setValue("imei", newList.join(", "))
    setValue("initialStock", newList.length)
  }

  const removeSerial = (index: number) => {
    const newList = serialList.filter((_, i) => i !== index)
    setSerialList(newList)
    setValue("imei", newList.join(", "))
    setValue("initialStock", newList.length)
  }

  useEffect(() => {
    if (formState.dirtyFields.brandId) setValue("modelId", "")
  }, [brandId, setValue, formState.dirtyFields.brandId])

  const onSubmit = (data: ItemFormValues) => {
    const callbacks = {
      onSuccess: () => {
        toast.success(`Product ${initialData ? "updated" : "saved"} successfully`)
        onSuccess?.()
      },
      onError: (err: Error) => toast.error(err.message)
    }
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
                <div className="flex items-center gap-2 mb-6 border-b pb-4">
                  <LayoutGrid className="h-4 w-4 text-blue-600" />
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
                    <ModelSelectField control={control} name="modelId" label="Model" required brandId={brandId} disabled={!brandId || isViewMode} readOnly={isViewMode} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-50">
                    <TextField control={control} name="purchasePrice" label="Purchase Price" type="number" required readOnly={isViewMode} />
                    <TextField control={control} name="salePrice" label="Selling Price" type="number" required readOnly={isViewMode} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <MasterSettingSelectField type="DEVICE_TYPE" control={control} name="deviceType" label="Device Type" readOnly={isViewMode} />
                    <TextField control={control} name="sku" label="System SKU" readOnly inputClassName="bg-slate-50 text-slate-400 border-dashed font-mono text-[10px]" />
                  </div>
                </div>
              </div>

              {/* Section 2: Technical Specifications */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
                <div className="flex items-center gap-2 mb-6 border-b pb-4">
                  <Settings2 className="h-4 w-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Technical Specs</h3>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <AttributeSelectField control={control} name="ram" attributeKey="RAM" label="RAM" readOnly={isViewMode} />
                    <AttributeSelectField control={control} name="rom" attributeKey="ROM" label="Storage (ROM)" readOnly={isViewMode} />
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

            {/* Section 3: Inventory & Fulfillment */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-6 border-b pb-4">
                <Package className="h-4 w-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Inventory & Fulfillment</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Side: Inventory Controls */}
                <div className="lg:col-span-6 space-y-6 p-5 bg-slate-50/50 rounded-2xl border border-slate-100 h-fit">
                  <div className="grid grid-cols-2 gap-6">
                    <RadioGroupField layout="partial-horizontal" control={control} name="condition" label="Item Condition" options={[{ label: "Used", value: "Used" }, { label: "New", value: "New" }]} readOnly={isViewMode} />
                    <RadioGroupField layout="partial-horizontal" control={control} name="addToKhata" label="Add to Khata?" options={[{ label: "Yes", value: "true" }, { label: "No", value: "false" }]} readOnly={isViewMode} />
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200/60">
                    <RadioGroupField layout="partial-horizontal" control={control} name="isBoxIncluded" label="Box?" options={[{ label: "Yes", value: "true" }, { label: "No", value: "false" }]} readOnly={isViewMode} />
                    <RadioGroupField layout="partial-horizontal" control={control} name="isChargerIncluded" label="Charger?" options={[{ label: "Yes", value: "true" }, { label: "No", value: "false" }]} readOnly={isViewMode} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200/60">
                    <BoxNumberSelectField control={control} name="boxNumberId" label="Storage Box" readOnly={isViewMode} />
                    <TextField control={control} name="storageNote" label="Storage Note" placeholder="Top shelf..." readOnly={isViewMode} />
                  </div>

                  <div className="flex flex-wrap gap-6 pt-4 border-t border-slate-200/60 mt-2">
                    <CheckboxField control={control} name="isTouchScreen" label="Touchscreen" disabled={isViewMode} />
                    <CheckboxField control={control} name="isSolidDevice" label="Solid Device" disabled={isViewMode} />
                    <CheckboxField control={control} name="isActive" label="Active (Show in POS)" disabled={isViewMode} />
                  </div>
                </div>

                {/* Right Side: Serial Manager */}
                <div className="lg:col-span-6 h-[350px]">
                  <div className="flex flex-col h-full bg-blue-50/30 rounded-2xl border border-blue-100 border-dashed p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 items-start">
                      <RadioGroupField
                        layout="partial-horizontal"
                        control={control}
                        name="isSerialized"
                        label="isSerialized?"
                        options={[{ label: "Yes", value: "true" }, { label: "No", value: "false" }]}
                        readOnly={isViewMode}
                      />
                      <TextField control={control} name="minStockLevel" label="Min Stock Alert" type="number" readOnly={isViewMode} />
                      <TextField 
                        control={control} 
                        name="initialStock" 
                        label="Opening Qty" 
                        type="number" 
                        readOnly={isViewMode || isSerialized} 
                        inputClassName={cn(isSerialized && "bg-blue-100 font-bold text-blue-700")} 
                      />
                    </div>

                    {isSerialized ? (
                      <div className="flex flex-col flex-1 overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4 text-blue-600" />
                            <span className="text-[11px] font-black text-blue-900 uppercase tracking-widest">Serial Number List</span>
                          </div>
                          <Badge className="bg-blue-600 text-white border-none font-black px-2 py-0.5 text-[9px]">
                            TOTAL: {serialList.length}
                          </Badge>
                        </div>

                        {!isViewMode && (
                          <div className="flex gap-2 mb-4">
                            <input
                              type="text"
                              value={currentSerial}
                              onChange={(e) => setCurrentSerial(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSerial())}
                              placeholder="Type IMEI and press Enter..."
                              className="flex-1 h-10 px-4 bg-white border border-blue-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                            <Button type="button" onClick={addSerial} className="bg-blue-600 hover:bg-blue-700 h-10 px-4 rounded-xl shadow-lg">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        )}

                        <div className="flex-1 overflow-y-auto bg-white/60 rounded-2xl p-4 border border-blue-100/50">
                          {serialList.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-300 opacity-60">
                              <Info className="h-5 w-5 mb-2" />
                              <p className="text-[10px] font-black uppercase tracking-widest text-center">Add serials to sync quantity</p>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {serialList.map((sn, idx) => (
                                <Badge key={idx} variant="outline" className="pl-3 pr-1 py-1.5 bg-white border-blue-100 text-blue-800 font-bold text-[10px] rounded-lg flex items-center gap-2">
                                  {sn}
                                  {!isViewMode && (
                                    <button type="button" onClick={() => removeSerial(idx)} className="p-0.5 hover:text-red-500 transition-colors">
                                      <X className="h-3 w-3" />
                                    </button>
                                  )}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 border border-dashed rounded-2xl p-10 text-center border-slate-200/60">
                        <Package className="h-10 w-10 text-slate-200 mb-3" />
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Bulk Inventory Mode</h4>
                        <p className="text-[10px] text-slate-300 mt-2 italic">Individual serial tracking is disabled.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Public Description */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="grid grid-cols-1">
                <TextareaField control={control} name="description" label="Marketing Description" rows={3} placeholder="Public details for invoices..." readOnly={isViewMode} />
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
            className="p-6 bg-white shadow-lg border-t"
          />
        </form>
      </Form>
    </FormProvider>
  )
}