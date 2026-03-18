"use client"

import { useEffect, useState } from "react"
import { FormProvider, useForm, useWatch } from "react-hook-form"
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
  const [serialList, setSerialList] = useState<string[]>(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((initialData as any)?.imei && initialData?.isSerialized) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (initialData as any).imei.split(",").map((s: string) => s.trim()).filter(Boolean)
    }
    return []
  })

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any
  })

  const { control, handleSubmit, setValue, formState } = form
  const brandId = useWatch({ control, name: "brandId" })
  const isSerialized = useWatch({ control, name: "isSerialized" }) === "true"

  // ১. ডাটা ক্লিনিং এবং কোয়ান্টিটি সিঙ্ক
  useEffect(() => {
    if (!isSerialized) {
      if (serialList.length > 0) {
        setTimeout(() => {
          setSerialList([])
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setValue("imei" as any, "")
        }, 0)
      }
    } else {
      setValue("initialStock", serialList.length)
    }
  }, [isSerialized, setValue, serialList.length])

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setValue("imei" as any, newList.join(", "))
    setValue("initialStock", newList.length)
  }

  const removeSerial = (index: number) => {
    const newList = serialList.filter((_, i) => i !== index)
    setSerialList(newList)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setValue("imei" as any, newList.join(", "))
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
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <form onSubmit={handleSubmit(onSubmit as any)} className="flex flex-col h-full bg-muted/30">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Section 1: Basic Information & Pricing */}
              <div className="bg-card p-6 rounded-xl shadow-sm border border-border h-fit relative">
                {isViewMode && (
                  <div className="absolute top-4 right-4 z-10">
                    <Button size="sm" variant="outline" type="button" onClick={() => setMode("edit")}>
                      <Edit3 className="mr-2 h-3.5 w-3.5" /> Edit
                    </Button>
                  </div>
                )}
                <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
                  <LayoutGrid className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Basic Information & Pricing</h3>
                </div>
                <div className="space-y-5">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <TextField control={control as any} name="name" label="Product Title" required placeholder="iPhone 15 Pro Max..." readOnly={isViewMode} />

                  <div className="grid grid-cols-2 gap-4">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <CategorySelectField control={control as any} name="categoryId" label="Category" required readOnly={isViewMode} />
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <SupplierSelectField control={control as any} name="supplierId" label="Supplier" readOnly={isViewMode} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <BrandSelectField control={control as any} name="brandId" label="Brand" required readOnly={isViewMode} />
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <ModelSelectField control={control as any} name="modelId" label="Model" required brandId={brandId} disabled={!brandId || isViewMode} readOnly={isViewMode} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border pb-2">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <TextField control={control as any} name="purchasePrice" label="Purchase Price" type="number" required readOnly={isViewMode} />
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <TextField control={control as any} name="salePrice" label="Selling Price" type="number" required readOnly={isViewMode} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <MasterSettingSelectField type="DEVICE_TYPE" control={control as any} name="deviceType" label="Device Type" readOnly={isViewMode} />
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <TextField control={control as any} name="sku" label="System SKU" readOnly inputClassName="bg-muted/50 text-muted-foreground border-dashed font-mono text-[10px]" />
                  </div>
                </div>
              </div>

              {/* Section 2: Technical Specifications */}
              <div className="bg-card p-6 rounded-xl shadow-sm border border-border h-fit">
                <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
                  <Settings2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Technical Specs</h3>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <AttributeSelectField control={control as any} name="ram" attributeKey="RAM" label="RAM" readOnly={isViewMode} />
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <AttributeSelectField control={control as any} name="rom" attributeKey="ROM" label="Storage (ROM)" readOnly={isViewMode} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <AttributeSelectField control={control as any} name="color" attributeKey="COLOR" label="Color" readOnly={isViewMode} />
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <AttributeSelectField control={control as any} name="grade" attributeKey="GRADE" label="Quality Grade" readOnly={isViewMode} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <TextField control={control as any} name="processor" label="Processor" readOnly={isViewMode} />
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <TextField control={control as any} name="batteryHealth" label="Battery %" placeholder="Ex: 95" readOnly={isViewMode} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <TextField control={control as any} name="camera" label="Camera Details" readOnly={isViewMode} />
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <TextField control={control as any} name="size" label="Screen Size" readOnly={isViewMode} />
                  </div>

                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <TextareaField control={control as any} name="note" label="Internal Technical Note" rows={2} readOnly={isViewMode} />
                </div>
              </div>
            </div>

            {/* Section 3: Inventory & Fulfillment */}
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
              <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
                <Package className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Inventory & Fulfillment</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Side: Inventory Controls */}
                <div className="lg:col-span-6 space-y-6 p-5 bg-muted/50 rounded-2xl border border-border h-fit">
                  <div className="grid grid-cols-2 gap-6">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <RadioGroupField layout="partial-horizontal" control={control as any} name="condition" label="Item Condition" options={[{ label: "Used", value: "Used" }, { label: "New", value: "New" }]} readOnly={isViewMode} />
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <RadioGroupField layout="partial-horizontal" control={control as any} name="addToKhata" label="Add to Khata?" options={[{ label: "Yes", value: "true" }, { label: "No", value: "false" }]} readOnly={isViewMode} />
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border/60">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <RadioGroupField layout="partial-horizontal" control={control as any} name="isBoxIncluded" label="Box?" options={[{ label: "Yes", value: "true" }, { label: "No", value: "false" }]} readOnly={isViewMode} />
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <RadioGroupField layout="partial-horizontal" control={control as any} name="isChargerIncluded" label="Charger?" options={[{ label: "Yes", value: "true" }, { label: "No", value: "false" }]} readOnly={isViewMode} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200/60">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */} {/* border-t border-slate-200/60 */}
                    <BoxNumberSelectField control={control as any} name="boxNumberId" label="Storage Box" readOnly={isViewMode} />
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <TextField control={control as any} name="storageNote" label="Storage Note" placeholder="Top shelf..." readOnly={isViewMode} />
                  </div>

                  <div className="flex flex-wrap gap-6 pt-4 border-t border-slate-200/60 mt-2">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <CheckboxField control={control as any} name="isTouchScreen" label="Touchscreen" disabled={isViewMode} />
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <CheckboxField control={control as any} name="isSolidDevice" label="Solid Device" disabled={isViewMode} />
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <CheckboxField control={control as any} name="isActive" label="Active (Show in POS)" disabled={isViewMode} />
                  </div>
                </div>

                {/* Right Side: Serial Manager */}
                <div className="lg:col-span-6 h-[350px]">
                  <div className="flex flex-col h-full bg-primary/10 rounded-2xl border border-primary/20 border-dashed p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 items-start">
                      <RadioGroupField
                        layout="partial-horizontal"
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        control={control as any}
                        name="isSerialized"
                        label="isSerialized?"
                        options={[{ label: "Yes", value: "true" }, { label: "No", value: "false" }]}
                        readOnly={isViewMode}
                      />
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      <TextField control={control as any} name="minStockLevel" label="Min Stock Alert" type="number" readOnly={isViewMode} />
                      <TextField 
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        control={control as any} 
                        name="initialStock" 
                        label="Opening Qty" 
                        type="number" 
                        readOnly={isViewMode || isSerialized}
                        inputClassName={cn(isSerialized && "bg-primary/10 font-bold text-primary")}
                      />
                    </div>

                    {isSerialized ? (
                      <div className="flex flex-col flex-1 overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2 text-primary">
                            <Smartphone className="h-4 w-4" />
                            <span className="text-[11px] font-black uppercase tracking-widest">Serial Number List</span>
                          </div>
                          <Badge className="bg-primary text-primary-foreground border-none font-black px-2 py-0.5 text-[9px]">
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
                              className="flex-1 h-10 px-4 bg-background border border-border rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/20"
                            />
                            <Button type="button" onClick={addSerial} className="bg-primary hover:bg-primary/90 h-10 px-4 rounded-xl shadow-lg">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        )}

                        <div className="flex-1 overflow-y-auto bg-background/60 rounded-2xl p-4 border border-border/50">
                          {serialList.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground/60">
                              <Info className="h-5 w-5 mb-2" />
                              <p className="text-[10px] font-black uppercase tracking-widest text-center">Add serials to sync quantity</p>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {serialList.map((sn, idx) => (
                                <Badge key={idx} variant="outline" className="pl-3 pr-1 py-1.5 bg-background border-primary/20 text-primary font-bold text-[10px] rounded-lg flex items-center gap-2">
                                  {sn}
                                  {!isViewMode && (
                                    <button type="button" onClick={() => removeSerial(idx)} className="p-0.5 hover:text-destructive transition-colors">
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
                      <div className="flex-1 flex flex-col items-center justify-center bg-muted border border-dashed rounded-2xl p-10 text-center border-border/60">
                        <Package className="h-10 w-10 text-muted-foreground/50 mb-3" />
                        <h4 className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">Bulk Inventory Mode</h4>
                        <p className="text-[10px] text-muted-foreground/80 mt-2 italic">Individual serial tracking is disabled.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Public Description */}
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
              <div className="grid grid-cols-1">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <TextareaField control={control as any} name="description" label="Marketing Description" rows={3} placeholder="Public details for invoices..." readOnly={isViewMode} />
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
          />
        </form>
      </Form>
    </FormProvider>
  )
}