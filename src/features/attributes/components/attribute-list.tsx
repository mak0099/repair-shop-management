"use client"

import { Tag, Loader2, Edit3, Layers } from "lucide-react"
import { useAttributes } from "../attribute.api"
import { useAttributeModal } from "../attribute-modal-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

export function AttributeList() {
  const { data: attributes, isLoading, isFetching } = useAttributes()
  const { openModal } = useAttributeModal()

  // Predefined Attribute keys for Products/Inventory
  const productAttributes = [
    { label: "RAM", key: "RAM" },
    { label: "Storage (ROM)", key: "ROM" },
    { label: "Colors", key: "COLOR" },
    { label: "Grade / Condition", key: "GRADE" },
    { label: "Warranty", key: "WARRANTY" },
    { label: "Accessories", key: "ACCESSORIES" }
  ]

  return (
    <div className="p-4 lg:p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header Section with Blue Accent */}
      <div className="flex flex-col gap-1 border-l-4 border-blue-600 pl-4">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-slate-900">
          <Layers className="h-6 w-6 text-blue-600" /> Product Attributes
        </h2>
        <p className="text-muted-foreground text-sm italic">
          Manage product variations like size, color, and technical specifications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {productAttributes.map((attr) => {
          const attributeData = attributes?.find((a) => a.key === attr.key)

          return (
            <Card key={attr.key} className="group border shadow-sm relative overflow-hidden transition-all duration-300">
              {/* Fetching Overlay */}
              {isFetching && !isLoading && (
                <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center backdrop-blur-[1px]">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
                </div>
              )}

              {/* Card Header with Blue Theme */}
              <CardHeader className="py-3 px-4 border-b bg-blue-50/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-700">
                    <Tag className="h-3.5 w-3.5 text-blue-600" /> {attr.label}
                  </CardTitle>
                  {!isLoading ? (
                    <Badge variant="secondary" className="text-[10px] bg-white text-blue-700 border-blue-100">
                      {attributeData?.values?.length || 0} Opts
                    </Badge>
                  ) : (
                    <Skeleton className="h-4 w-8" />
                  )}
                </div>
              </CardHeader>

              {/* Card Content for Attribute Options */}
              <CardContent className="pt-4 space-y-5">
                <div className="flex flex-wrap gap-1.5 min-h-[80px] content-start overflow-y-auto max-h-[120px] pr-1 custom-scrollbar">
                  {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-5 w-12 rounded-full" />)
                  ) : attributeData?.values && attributeData.values.length > 0 ? (
                    attributeData.values.map((opt, i) => (
                      <Badge key={i} variant="outline" className="font-normal bg-white text-[10px] border-slate-200">
                        {opt.value}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-400 italic">No options configured.</span>
                  )}
                </div>
                
                <Button 
                  variant="outline"
                  disabled={isLoading || !attributeData}
                  className="w-full h-9 group-hover:bg-blue-600 group-hover:text-white transition-colors border-slate-300 text-xs" 
                  onClick={() => {
                    if (attributeData) openModal({ initialData: attributeData })
                  }}
                >
                  <Edit3 className="mr-2 h-3.5 w-3.5" /> Edit {attr.label}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}