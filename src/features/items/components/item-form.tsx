"use client"

import { FormProvider, useForm, Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Cpu, ClipboardCheck, Wallet, Save, RotateCcw } from "lucide-react"
import { toast } from "sonner"

import { TextField } from "@/components/forms/text-field"
import { TextareaField } from "@/components/forms/textarea-field"
import { CheckboxField } from "@/components/forms/checkbox-field"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { itemSchema, type ItemFormValues } from "../item.schema"
import { useCreateItem } from "../item.api"
import { CategorySelectField } from "@/features/categories/components/category-select-field"
import { BrandSelectField } from "@/features/brands/components/brand-select-field"
import { ModelSelectField } from "@/features/models/components/model-select-field"

export function ItemForm({ onSuccess }: { onSuccess?: () => void }) {
  const { mutate: createItem, isPending } = useCreateItem()

  const form = useForm<ItemFormValues>({
    // FIX: Breaking the inference loop
    resolver: zodResolver(itemSchema) as unknown as Resolver<ItemFormValues>,
    defaultValues: {
      name: "",
      purchasePrice: 0,
      salePrice: 0,
      initialStock: 0,
      isTouchScreen: false,
      isSolidDevice: false,
      isBoxIncluded: false,
      isChargerIncluded: false,
      addToKhata: false,
      isActive: true,
      condition: "Used",
    }
  })

  const onSubmit = (data: ItemFormValues) => {
    createItem(data, {
      onSuccess: () => {
        toast.success("Product saved successfully")
        onSuccess?.()
      }
    })
  }

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="bg-slate-50/30 p-4 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Column 1: Financials */}
            <Card className="shadow-sm border-t-4 border-t-blue-500">
              <CardHeader className="bg-white border-b py-3">
                <CardTitle className="text-xs uppercase flex items-center gap-2"><Wallet className="h-4 w-4" /> Pricing & Identity</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <TextField control={form.control} name="name" label="Product Name" required />
                <CategorySelectField control={form.control} name="categoryId" label="Category" required />
                <div className="grid grid-cols-2 gap-4">
                  <BrandSelectField control={form.control} name="brandId" label="Brand" required />
                  <ModelSelectField control={form.control} name="modelId" label="Model" />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <TextField control={form.control} name="purchasePrice" label="Cost" type="number" />
                  <TextField control={form.control} name="salePrice" label="S. Price" type="number" />
                </div>
              </CardContent>
            </Card>

            {/* Column 2: Hardware */}
            <Card className="shadow-sm border-t-4 border-t-indigo-500">
              <CardHeader className="bg-white border-b py-3">
                <CardTitle className="text-xs uppercase flex items-center gap-2"><Cpu className="h-4 w-4" /> Hardware Specs</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <TextField control={form.control} name="imei" label="IMEI / Serial" />
                <div className="grid grid-cols-2 gap-4">
                  <TextField control={form.control} name="ram" label="RAM" />
                  <TextField control={form.control} name="rom" label="ROM" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <TextField control={form.control} name="color" label="Color" />
                  <TextField control={form.control} name="grade" label="Grade" />
                </div>
                <CheckboxField control={form.control} name="isTouchScreen" label="Touch Screen?" />
              </CardContent>
            </Card>

            {/* Column 3: Logistics */}
            <Card className="shadow-sm border-t-4 border-t-emerald-500">
              <CardHeader className="bg-white border-b py-3">
                <CardTitle className="text-xs uppercase flex items-center gap-2"><ClipboardCheck className="h-4 w-4" /> Logistics</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-1 gap-2 bg-slate-50 p-3 rounded border">
                  <CheckboxField control={form.control} name="isBoxIncluded" label="Box Included" />
                  <CheckboxField control={form.control} name="isChargerIncluded" label="Charger Included" />
                  <CheckboxField control={form.control} name="addToKhata" label="Add to Khata" />
                </div>
                <TextField control={form.control} name="initialStock" label="Opening Stock" type="number" />
                <TextareaField control={form.control} name="description" label="Storage Description" />
              </CardContent>
            </Card>

          </div>

          <div className="flex justify-end gap-3 border-t pt-4 bg-white p-4 rounded-lg shadow-inner">
            <Button variant="outline" type="button" onClick={() => form.reset()}><RotateCcw className="mr-2 h-4 w-4" /> Reset</Button>
            <Button type="submit" disabled={isPending} className="bg-slate-900 px-10">
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save Product
            </Button>
          </div>
        </form>
      </Form>
    </FormProvider>
  )
}