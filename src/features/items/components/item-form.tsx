"use client"

import { useEffect, useState } from "react"
import { FormProvider, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Edit3, Package, LayoutGrid, Settings2, Tag, Layers, Hash } from "lucide-react"
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
import { useBrandOptions } from "@/features/brands/brand.api"
import { useModelOptions } from "@/features/models/model.api"

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

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: initialData ? {
      ...initialData,
      isSerialized: initialData.isSerialized ? "true" : "false",
    } : {
      name: "",
      subtitle: "",
      condition: "NEW",
      purchasePrice: 0,
      salePrice: 0,
      minStockLevel: 2, // স্কিমা অনুযায়ী সঠিক নাম
      isTouchScreen: true,
      isSolidDevice: false,
      isActive: true,
      isSerialized: "false",
      ram: "",
      rom: "",
      color: "",
      categoryId: "",
      supplierId: "",
      brandId: "",
      modelId: "",
      deviceType: "",
      sku: generateSKU(), // Auto-generate SKU to satisfy validation
      processor: "",
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
  const modelId = useWatch({ control, name: "modelId" })
  const ram = useWatch({ control, name: "ram" })
  const rom = useWatch({ control, name: "rom" })
  const color = useWatch({ control, name: "color" })
  const condition = useWatch({ control, name: "condition" })
  const isSerialized = useWatch({ control, name: "isSerialized" }) === "true"

  // Fetching options to get the actual names for auto-generation
  const { data: brands } = useBrandOptions()
  const { data: models } = useModelOptions()

  useEffect(() => {
    if (formState.dirtyFields.brandId) setValue("modelId", "")
  }, [brandId, setValue, formState.dirtyFields.brandId])

  // Auto-generate Product Title
  useEffect(() => {
    if (!isViewMode && brands && models) {
      const brandName = brands.find((b: { id: string; name: string }) => b.id === brandId)?.name || ""
      const modelName = models.find((m: { id: string; name: string }) => m.id === modelId)?.name || ""
      
      const conditionText = condition && condition !== "NEW" ? `(${condition})` : ""
      const parts = [brandName, modelName, ram, rom, color, conditionText].filter(Boolean)
      const generatedName = parts.join(" ")
      
      if (generatedName || formState.dirtyFields.brandId || formState.dirtyFields.modelId) {
        setValue("name", generatedName, { shouldValidate: !!generatedName, shouldDirty: true })
      }
    }
  }, [brandId, modelId, ram, rom, color, condition, brands, models, isViewMode, setValue, formState.dirtyFields])

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

            {isViewMode && (
              <div className="flex justify-end">
                <Button size="sm" type="button" onClick={() => setMode("edit")} className="shadow-sm">
                  <Edit3 className="mr-2 h-4 w-4" /> Edit Master Product
                </Button>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Heavy Data Entry (Descriptions, Specs) - 8/12 width */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Section 1: Basic Information */}
                <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                  <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
                    <LayoutGrid className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Basic Information</h3>
                  </div>
                  <div className="space-y-5">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      <CategorySelectField control={control as any} name="categoryId" label="Category" required readOnly={isViewMode} />
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      <SupplierSelectField control={control as any} name="supplierId" label="Default Supplier" readOnly={isViewMode} />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      <BrandSelectField control={control as any} name="brandId" label="Brand" required readOnly={isViewMode} />
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      <ModelSelectField control={control as any} name="modelId" label="Model" required brandId={brandId} disabled={!brandId || isViewMode} readOnly={isViewMode} />
                    </div>

                    <div className="p-3 bg-muted/30 rounded-lg border border-border">
                      <RadioGroupField
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        control={control as any}
                        name="condition"
                        label="Item Condition"
                        options={[{ label: "New", value: "NEW" }, { label: "Used", value: "USED" }, { label: "Refurbished", value: "REFURBISHED" }]}
                        readOnly={isViewMode}
                        layout="partial-horizontal"
                      />
                    </div>

                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <TextField control={control as any} name="subtitle" label="Subtitle / Variant (Optional)" placeholder="E.g. EU Version, Global, Special Edition..." readOnly={isViewMode} />
                  </div>
                </div>

                {/* Section 2: Technical Specifications */}
                <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                  <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
                    <Settings2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Technical Specs</h3>
                  </div>
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      <MasterSettingSelectField type="DEVICE_TYPE" control={control as any} name="deviceType" label="Device Type" readOnly={isViewMode} />
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      <AttributeSelectField control={control as any} name="ram" attributeKey="RAM" label="RAM" readOnly={isViewMode} />
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      <AttributeSelectField control={control as any} name="rom" attributeKey="ROM" label="Storage (ROM)" readOnly={isViewMode} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      <AttributeSelectField control={control as any} name="color" attributeKey="COLOR" label="Color" readOnly={isViewMode} />
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      <TextField control={control as any} name="processor" label="Processor" readOnly={isViewMode} />
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      <TextField control={control as any} name="camera" label="Camera Details" readOnly={isViewMode} />
                    </div>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <TextField control={control as any} name="size" label="Screen Size" readOnly={isViewMode} />
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <TextareaField control={control as any} name="note" label="Internal Technical Note" rows={2} readOnly={isViewMode} />
                  </div>
                </div>

                {/* Section 3: Public Description */}
                <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                  <div className="grid grid-cols-1">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <TextareaField control={control as any} name="description" label="Marketing Description" rows={4} placeholder="Public details for online store or invoices..." readOnly={isViewMode} />
                  </div>
                </div>
              </div>

              {/* Right Column: Rules, Pricing & Metadata - 4/12 width */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Product Summary & Live Preview */}
                <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                  <div className="flex items-center gap-2 mb-4 border-b border-border pb-4">
                    <Package className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Product Summary</h3>
                  </div>
                  <div className="space-y-4">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <TextareaField 
                      control={control as any} 
                      name="name" 
                      label="Final Product Title" 
                      required 
                      placeholder="Waiting for selections..." 
                      readOnly 
                      rows={2}
                      className="font-bold text-primary border-primary/20 pointer-events-none resize-none" 
                    />
                    
                    <div className="p-3 bg-muted/50 rounded-lg border border-border flex items-center justify-between">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">System SKU</span>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      <TextField control={control as any} name="sku" readOnly inputClassName="h-8 w-32 bg-transparent text-right font-mono text-xs font-bold border-none shadow-none focus-visible:ring-0 p-0 m-0" />
                    </div>
                  </div>
                </div>

                {/* Default Pricing */}
                <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                  <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
                    <Tag className="h-4 w-4 text-amber-600" />
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Pricing & Setup</h3>
                  </div>
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      <TextField control={control as any} name="purchasePrice" label="Default Cost" type="number" min={0} required readOnly={isViewMode} />
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      <TextField control={control as any} name="salePrice" label="Default Sale Price" type="number" min={0} required readOnly={isViewMode} />
                    </div>
                  </div>
                </div>

                {/* Inventory Rules */}
                <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                  <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
                    <Layers className="h-4 w-4 text-emerald-600" />
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Inventory Rules</h3>
                  </div>
                  <div className="space-y-6">
                    <div className="p-4 rounded-xl border border-primary/20 bg-primary/5">
                      <RadioGroupField
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        control={control as any}
                        name="isSerialized"
                        label="Serialized Item?"
                        options={[{ label: "Yes", value: "true" }, { label: "No", value: "false" }]}
                        readOnly={isViewMode}
                      />
                      <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
                        Select <strong className="text-primary">Yes</strong> for Phones, Laptops, etc. Select <strong className="text-primary">No</strong> for accessories, cables, batteries.
                      </p>
                    </div>

                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <TextField control={control as any} name="minStockLevel" label="Low Stock Alert Level" type="number" min={0} readOnly={isViewMode} />
                  </div>
                </div>

                {/* Default Location */}
                <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                  <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
                    <Package className="h-4 w-4 text-purple-600" />
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Default Location</h3>
                  </div>
                  <div className="space-y-4">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <BoxNumberSelectField control={control as any} name="boxNumberId" label="Storage Box/Bin" readOnly={isViewMode} />
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <TextField control={control as any} name="storageNote" label="Storage Note" placeholder="E.g. Top shelf, left corner..." readOnly={isViewMode} />
                  </div>
                </div>

                {/* Properties & Flags */}
                <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                  <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
                    <Hash className="h-4 w-4 text-pink-600" />
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Properties</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <span className="text-xs font-semibold text-foreground">Touchscreen Device</span>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      <CheckboxField control={control as any} name="isTouchScreen" disabled={isViewMode} />
                    </div>
                    <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <span className="text-xs font-semibold text-foreground">Solid Device</span>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      <CheckboxField control={control as any} name="isSolidDevice" disabled={isViewMode} />
                    </div>
                    <div className="flex items-center justify-between p-3 border-l-4 border-l-primary border-y border-r border-border rounded-lg bg-primary/5">
                      <span className="text-xs font-bold text-foreground">Active (Show in POS)</span>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      <CheckboxField control={control as any} name="isActive" disabled={isViewMode} />
                    </div>
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
          />
        </form>
      </Form>
    </FormProvider>
  )
}