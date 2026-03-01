"use client"

import { Tag, Loader2, Edit3, Layers } from "lucide-react"
import { useAttributes } from "../attribute.api"
import { useAttributeModal } from "../attribute-modal-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/shared/page-header"

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
    { label: "Accessories", key: "ACCESSORY" }
  ]

  return (
    <div className="space-y-4 w-full max-w-full">
      <PageHeader 
        title="Product Attributes" 
        description="Manage product variations like size, color, and technical specifications."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
        {productAttributes.map((attr) => {
          const attributeData = attributes?.data?.find((a) => a.key?.toUpperCase() === attr.key?.toUpperCase())

          return (
            <Card key={attr.key} className="flex flex-col overflow-hidden">
              {/* Fetching Overlay */}
              {isFetching && !isLoading && (
                <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center backdrop-blur-[1px]">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              )}

              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" /> {attr.label}
                  </CardTitle>
                  {!isLoading ? (
                    <Badge variant="secondary" className="font-normal">
                      {attributeData?.values?.length || 0} Opts
                    </Badge>
                  ) : (
                    <Skeleton className="h-5 w-8" />
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col gap-4 pt-0">
                <div className="flex flex-wrap gap-1.5 min-h-[80px] content-start">
                  {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-6 w-12 rounded-full" />)
                  ) : attributeData?.values && attributeData.values.length > 0 ? (
                    attributeData.values.slice(0, 12).map((opt, i) => (
                      <Badge key={i} variant="outline" className="font-normal bg-slate-50">
                        {opt.value}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground italic">No options configured.</span>
                  )}
                  {attributeData?.values && attributeData.values.length > 12 && (
                     <Badge variant="outline" className="font-normal bg-slate-50">+{attributeData.values.length - 12} more</Badge>
                  )}
                </div>
                
                <div className="mt-auto pt-2">
                    <Button 
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                    className="w-full" 
                    onClick={() => {
                        openModal({ 
                          title: attributeData ? `Edit ${attr.label}` : `Configure ${attr.label}`,
                          initialData: attributeData ?? {
                            id: "",
                            key: attr.key,
                            name: attr.label,
                            description: "",
                            values: []
                          } 
                        })
                    }}
                    >
                    <Edit3 className="mr-2 h-3.5 w-3.5" /> {attributeData ? "Edit Options" : "Configure"}
                    </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}