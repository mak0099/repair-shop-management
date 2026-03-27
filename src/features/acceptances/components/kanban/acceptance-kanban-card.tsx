"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Smartphone, User } from "lucide-react"
import { Acceptance } from "../../acceptance.schema"
import { CurrencyText } from "@/components/shared/data-table-cells"

interface KanbanCardProps {
  acceptance: Acceptance;
  onClick: () => void;
}

export function AcceptanceKanbanCard({ acceptance, onClick }: KanbanCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow mb-3 border-l-4 border-l-primary bg-background" onClick={onClick}>
      <CardContent className="p-3">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-black text-foreground">#{acceptance.acceptanceNumber}</span>
          {acceptance.urgent && <Badge variant="destructive" className="text-[8px] px-1 py-0 uppercase">Urgent</Badge>}
        </div>
        <div className="space-y-1.5 mb-3">
          <p className="text-xs font-bold flex items-center gap-1.5"><Smartphone className="h-3 w-3 text-muted-foreground" /> {acceptance.brandId} {acceptance.modelId}</p>
        </div>
        <div className="flex justify-between items-center text-[9px] text-muted-foreground border-t pt-2 mt-2">
           <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(acceptance.acceptanceDate).toLocaleDateString()}</span>
           <span className="font-bold text-emerald-600"><CurrencyText amount={acceptance.balanceDue || 0} /> Due</span>
        </div>
      </CardContent>
    </Card>
  )
}