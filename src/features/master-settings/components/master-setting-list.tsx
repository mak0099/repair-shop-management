"use client"

import { Settings, Loader2, Wrench, Edit3 } from "lucide-react"
import { useMasterSettings } from "../master-setting.api"
import { useMasterSettingModal } from "../master-setting-modal-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

export function MasterSettingList() {
  const { data: masters, isLoading, isFetching } = useMasterSettings()
  const { openModal } = useMasterSettingModal()

  // Futuristic Master Settings Keys
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
    <div className="p-4 lg:p-6 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-1 border-l-4 border-amber-500 pl-4">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-slate-900">
          <Wrench className="h-6 w-6 text-amber-500" /> Business Settings
        </h2>
        <p className="text-muted-foreground text-sm italic">
          Configure global parameters for finance, logistics, and shop operations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {systemMasters.map((master) => {
          const masterData = masters?.find((m) => m.key === master.key)

          return (
            <Card key={master.key} className="group border shadow-sm relative overflow-hidden transition-all duration-300">
              {isFetching && !isLoading && (
                <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center backdrop-blur-[1px]">
                  <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                </div>
              )}

              <CardHeader className="py-3 px-4 border-b bg-amber-50/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-700">
                    <Settings className="h-3.5 w-3.5 text-amber-500" /> {master.label}
                  </CardTitle>
                  {!isLoading ? (
                    <Badge variant="secondary" className="text-[10px] bg-white text-amber-700 border-amber-100">
                      {masterData?.values.length || 0} Vals
                    </Badge>
                  ) : (
                    <Skeleton className="h-4 w-8" />
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-4 space-y-5">
                <div className="flex flex-wrap gap-1.5 min-h-[80px] content-start overflow-y-auto max-h-[120px] pr-1 custom-scrollbar">
                  {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-5 w-12 rounded-full" />)
                  ) : masterData?.values && masterData.values.length > 0 ? (
                    masterData.values.map((v, i) => (
                      <Badge key={i} variant="outline" className="font-normal bg-white text-[10px]">
                        {v.value}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-400 italic">Configure values.</span>
                  )}
                </div>
                
                <Button 
                  variant="outline"
                  disabled={isLoading || !masterData}
                  className="w-full h-9 group-hover:bg-amber-600 group-hover:text-white transition-colors border-slate-300 text-xs" 
                  onClick={() => {
                    if (masterData) openModal({ initialData: masterData })
                  }}
                >
                  <Edit3 className="mr-2 h-3.5 w-3.5" /> Edit {master.label}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}