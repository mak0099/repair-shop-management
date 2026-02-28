"use client"

import { useState } from "react"
import { FormProvider, useForm, Resolver } from "react-hook-form" // Added Resolver import
import { zodResolver } from "@hookform/resolvers/zod"
import { Printer, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TextField } from "@/components/forms/text-field"
import { CheckboxField } from "@/components/forms/checkbox-field"
import { SelectField } from "@/components/forms/select-field"

import { barcodeSchema, type BarcodeRequest } from "../barcode.schema"
import { ItemSearchField } from "./item-search-field"
import { BarcodePrintLayout } from "./barcode-print-layout"

export function BarcodeGenerator() {
  const [previewData, setPreviewData] = useState<BarcodeRequest | null>(null)

  const form = useForm<BarcodeRequest>({
    /**
     * CRITICAL FIX: We cast the resolver to 'unknown' then to 'Resolver<BarcodeRequest>'.
     * This breaks the TypeScript recursion loop where 'quantity' was being seen as 'unknown'.
     */
    resolver: zodResolver(barcodeSchema) as unknown as Resolver<BarcodeRequest>,
    defaultValues: {
      itemId: "",
      variantId: null,
      quantity: 1,
      labelSize: "38x25mm",
      includePrice: true,
      includeName: true,
    },
  })

  const { control, handleSubmit } = form

  function onSubmit(data: BarcodeRequest) {
    setPreviewData(data)
  }

  return (
    <div className="space-y-6">
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader className="bg-slate-50 border-b">
                  <CardTitle className="text-sm font-bold uppercase text-slate-500">
                    Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 pt-6">
                  <ItemSearchField control={control} name="itemId" />
                  
                  <TextField 
                    control={control} 
                    name="quantity" 
                    label="Number of Labels" 
                    type="number" 
                  />

                  <SelectField
                    control={control}
                    name="labelSize"
                    label="Label Size"
                    placeholder="Select size"
                    searchPlaceholder="Search sizes..."
                    options={[
                      { label: "Small (38x25mm)", value: "38x25mm" },
                      { label: "Medium (50x30mm)", value: "50x30mm" },
                      { label: "A4 - 40 Labels", value: "A4_40_Labels" },
                    ]}
                  />

                  <div className="grid grid-cols-2 gap-4 border-t border-dashed pt-4 mt-2">
                    <CheckboxField control={control} name="includeName" label="Show Name" />
                    <CheckboxField control={control} name="includePrice" label="Show Price" />
                  </div>

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-10">
                    <RefreshCw className="mr-2 h-4 w-4" /> Generate Preview
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card className="min-h-[500px]">
                <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50">
                  <CardTitle className="text-sm font-bold uppercase text-slate-500">
                    Print Preview
                  </CardTitle>
                  {previewData && (
                    <Button onClick={() => window.print()} variant="default" size="sm">
                      <Printer className="mr-2 h-4 w-4" /> Print Labels
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="p-8 flex justify-center bg-white">
                  {previewData ? (
                    <BarcodePrintLayout data={previewData} />
                  ) : (
                    <div className="text-center text-muted-foreground py-32 border-2 border-dashed rounded-xl w-full">
                      Generate a preview to see the layout.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}