"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Smartphone, User, Info } from "lucide-react"
import { Acceptance } from "../../acceptance.schema"

export function TicketOverview({ acceptance }: { acceptance: Acceptance }) {

  return (
    <Card className="shadow-sm border-border">
      <CardHeader className="py-3 border-b">
        <CardTitle className="text-xs flex items-center gap-2 uppercase tracking-widest text-muted-foreground font-black">
          <Smartphone className="h-4 w-4 text-primary" /> Device & Customer Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div>
          <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mb-2">Customer Details</p>
          <p className="font-bold flex items-center gap-2 text-sm"><User className="h-3 w-3 text-muted-foreground" /> {acceptance.customer?.name || acceptance.customerId || 'N/A'}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {/* Device Model Section */}
          <div>
            <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mb-2">Device Model</p>
            <p className="font-bold text-sm">{acceptance.brand?.name || acceptance.brandId || 'N/A'} {acceptance.model?.name || acceptance.modelId || 'N/A'} <span className="font-normal text-muted-foreground ml-1 block text-xs mt-1">({acceptance.color || 'No color specified'})</span></p>
            <p className="text-xs text-muted-foreground font-mono mt-2 bg-muted/50 inline-block px-2 py-0.5 rounded border">IMEI: {acceptance.imei}</p>
          </div>

          {/* Device Extras Section */}
          <div className="bg-muted/40 p-3 rounded-lg border border-border">
            <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mb-2 flex items-center gap-1"><Info className="h-3 w-3" /> Extras</p>
            <div className="space-y-1 text-xs">
              <p><span className="font-medium text-muted-foreground">Type:</span> {acceptance.deviceType || 'N/A'}</p>
              <p><span className="font-medium text-muted-foreground">Color:</span> {acceptance.color || 'N/A'}</p>
              <p><span className="font-medium text-muted-foreground">Accessories:</span> {acceptance.accessories || 'None'}</p>
              {acceptance.pinUnlock && (
                <div className="border-t border-border/50">
                  <p className="text-[9px] text-amber-700 font-bold uppercase">🔒 PIN: {acceptance.pinUnlockNumber}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="bg-destructive/5 p-3 rounded-lg border border-destructive/10">
          <p className="text-[9px] text-destructive font-black uppercase tracking-widest mb-1.5 flex items-center gap-1">⚠️ Reported Defect</p>
          <p className="font-medium text-xs leading-relaxed">{acceptance.defectDescription}</p>
        </div>
      </CardContent>
    </Card>
  )
}