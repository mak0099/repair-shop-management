"use client"

import { useState } from "react"
import { Wand2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAttributes } from "@/features/attributes/attribute.api"
import { createVariantsFromAttributes } from "../item.utils"
import { Item } from "../item.schema"

interface VariantGeneratorProps {
  onGenerate: (variants: Partial<Item>[]) => void
  productName: string
}

export function VariantGenerator({ onGenerate, productName }: VariantGeneratorProps) {
  const { data: attributesResponse } = useAttributes()
  const [selections, setSelections] = useState<Record<string, string[]>>({})

  /**
   * FIX: Changed 'items' to 'data'.
   * Most PaginatedResponse types in this project use 'data' to hold the array.
   */
  const attributeList = attributesResponse?.data || []

  const toggleValue = (attrName: string, value: string) => {
    setSelections((prev) => {
      const currentValues = prev[attrName] || []
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value]
      
      const newSelections = { ...prev, [attrName]: newValues }
      if (newValues.length === 0) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [attrName]: _, ...rest } = newSelections
        return rest
      }
      return newSelections
    })
  }

  const handleGenerate = () => {
    if (Object.keys(selections).length === 0) return
    
    const newVariants = createVariantsFromAttributes(productName, selections) as Partial<Item>[]
    onGenerate(newVariants)
  }

  return (
    <Card className="bg-slate-50/50 border-dashed border-2 shadow-none">
      <CardContent className="pt-6 space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-tight">Variant Generator</h4>
            <p className="text-xs text-slate-500">Select specifications to create product combinations.</p>
          </div>
          <Button 
            type="button" 
            size="sm" 
            onClick={handleGenerate}
            disabled={Object.keys(selections).length === 0}
            className="bg-blue-600 hover:bg-blue-700 shadow-sm transition-all active:scale-95"
          >
            <Wand2 className="mr-2 h-4 w-4" /> 
            Generate Combinations
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {attributeList.map((attr) => (
            <div key={attr.id} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{attr.name}</span>
                <div className="h-[1px] flex-1 bg-slate-200/60"></div>
              </div>
              <div className="flex flex-wrap gap-2">
                {attr.values.map((v) => {
                  const isSelected = selections[attr.name]?.includes(v.value)
                  return (
                    <Button
                      key={v.value}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      className={`h-8 text-xs transition-all ${
                        isSelected 
                          ? "bg-slate-900 text-white border-slate-900" 
                          : "bg-white text-slate-600 hover:bg-slate-100 border-slate-200"
                      }`}
                      onClick={() => toggleValue(attr.name, v.value)}
                    >
                      {v.value}
                    </Button>
                  )
                })}
              </div>
            </div>
          ))}

          {attributeList.length === 0 && (
            <div className="py-10 text-center border rounded-xl bg-white/50 border-slate-100">
              <p className="text-xs text-slate-400 font-medium">No attributes found. Please add RAM, ROM, or Color in settings.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}