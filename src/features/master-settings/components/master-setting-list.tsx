"use client"

import { Settings, Loader2, Edit3 } from "lucide-react"
import { useMasterSettings } from "../master-setting.api"
import { useMasterSettingModal } from "../master-setting-modal-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { PageHeader } from "@/components/shared/page-header"

export function MasterSettingList() {
  /**
   * masters is a PaginatedResponse, so we look for 'data' inside it.
   */
  const { data: mastersResponse, isLoading, isFetching } = useMasterSettings()
  const { openModal } = useMasterSettingModal()

  // Business Logic: Extract the actual array from pagination
  const mastersList = mastersResponse?.data || []

  const systemMasters = [
    { label: "Device Type", key: "DEVICE_TYPE" },
    { label: "Payment Methods", key: "PAYMENT_METHOD" },
    { label: "Expense Category", key: "EXPENSE_CATEGORY" },
    { label: "QC Items", key: "QC_ITEM" },
    { label: "Repair Status", key: "REPAIR_STATUS" },
    { label: "Return Status", key: "RETURN_STATUS" },
    { label: "Designations", key: "DESIGNATION" }
  ]

  return (
    <div className="space-y-4 w-full max-w-full">
      <PageHeader 
        title="Business Settings" 
        description="Configure global parameters for finance, logistics, and shop operations."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
        {systemMasters.map((master) => {
          /**
           * FIX: We now search within 'mastersList' (which is mastersResponse.data)
           */
          const masterData = mastersList.find((m) => m.key === master.key)

          return (
            <Card key={master.key} className="flex flex-col overflow-hidden">
              {isFetching && !isLoading && (
                <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center backdrop-blur-[1px]">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              )}

              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Settings className="h-4 w-4 text-muted-foreground" /> {master.label}
                  </CardTitle>
                  {!isLoading ? (
                    <Badge variant="secondary" className="font-normal">
                      {masterData?.values.length || 0} Vals
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
                  ) : masterData?.values && masterData.values.length > 0 ? (
                    masterData.values.slice(0, 12).map((v, i) => (
                      <Badge key={i} variant="outline" className="font-normal bg-slate-50">
                        {v.value}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground italic">Configure values.</span>
                  )}
                  {masterData?.values && masterData.values.length > 12 && (
                     <Badge variant="outline" className="font-normal bg-slate-50">+{masterData.values.length - 12} more</Badge>
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
                          title: masterData ? `Edit ${master.label}` : `Configure ${master.label}`,
                          initialData: masterData ?? {
                            id: "",
                            key: master.key,
                            name: master.label,
                            description: "",
                            values: [],
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                          } 
                        })
                    }}
                    >
                    <Edit3 className="mr-2 h-3.5 w-3.5" /> {masterData ? "Edit Options" : "Configure"}
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