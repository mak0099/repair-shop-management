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
    <Card className="bg-muted/50 border-dashed border-2 shadow-none">
      <CardContent className="pt-6 space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-foreground uppercase tracking-tight">Variant Generator</h4>
            <p className="text-xs text-muted-foreground">Select specifications to create product combinations.</p>
          </div>
          <Button 
            type="button" 
            size="sm" 
            onClick={handleGenerate}
            disabled={Object.keys(selections).length === 0}
            className="bg-primary hover:bg-primary/90 shadow-sm transition-all active:scale-95"
          >
            <Wand2 className="mr-2 h-4 w-4" /> 
            Generate Combinations
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {attributeList.map((attr) => (
            <div key={attr.id} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{attr.name}</span>
                <div className="h-[1px] flex-1 bg-border/60"></div>
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
                      className="h-8 text-xs transition-all"
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
            <div className="py-10 text-center border rounded-xl bg-card/50 border-border">
              <p className="text-xs text-muted-foreground font-medium">No attributes found. Please add RAM, ROM, or Color in settings.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}