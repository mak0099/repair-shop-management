"use client"

import { useState } from "react"
import { Printer, ArrowRightLeft, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Acceptance } from "../../acceptance.schema"
import { toast } from "sonner"
import { useUpdateAcceptance } from "../../acceptance.api"
import { REPAIR_STATUS_OPTIONS, REPAIR_STATUSES } from "../../acceptance.constants"
import { AcceptanceReceiptView } from "./acceptance-receipt-view"

interface TicketHeaderProps {
  acceptance: Acceptance
}

const getStatusBadgeColor = (status: string): { bg: string; text: string; border: string } => {
  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    [REPAIR_STATUSES.PENDING]: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
    [REPAIR_STATUSES.DIAGNOSING]: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
    [REPAIR_STATUSES.IN_PROGRESS]: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
    [REPAIR_STATUSES.ON_HOLD]: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
    [REPAIR_STATUSES.WAITING_PARTS]: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
    [REPAIR_STATUSES.UNREPAIRABLE]: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
    [REPAIR_STATUSES.READY]: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
    [REPAIR_STATUSES.DELIVERED]: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
    [REPAIR_STATUSES.TRADE_IN]: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
    [REPAIR_STATUSES.BUYBACK]: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
    [REPAIR_STATUSES.CANCELLED]: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  };
  return colorMap[status] || { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" };
};

const getStatusLabel = (status: string): string => {
  const option = REPAIR_STATUS_OPTIONS.find(opt => opt.value === status);
  return option?.label || status;
};

export function TicketHeader({ acceptance }: TicketHeaderProps) {
  const { mutate: updateTicket, isPending } = useUpdateAcceptance()
  const [showReceipt, setShowReceipt] = useState(false)

  const isDelivered = acceptance.currentStatus === REPAIR_STATUSES.DELIVERED
  const canPrint = isDelivered

  const handleBuyback = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateTicket({ id: acceptance.id as string, data: { currentStatus: REPAIR_STATUSES.TRADE_IN } as any }, {
      onSuccess: () => toast.success("Ticket converted to Trade-in!")
    });
  }

  const badgeColor = getStatusBadgeColor(acceptance.currentStatus);
  const statusLabel = getStatusLabel(acceptance.currentStatus);

  return (
    <>
      <div className="flex items-center justify-between px-6 py-3 bg-background border-b shadow-sm rounded-t-lg pr-12">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-lg font-black tracking-tight">#{acceptance.acceptanceNumber}</h2>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Date: {new Date(acceptance.acceptanceDate).toLocaleDateString()}</p>
          </div>
          <div className={`ml-4 flex items-center ${badgeColor.bg} border ${badgeColor.border} rounded-md px-3 py-1`}>
            <Activity className={`h-3.5 w-3.5 ${badgeColor.text} mr-2`} />
            <span className={`text-xs font-black uppercase tracking-widest ${badgeColor.text}`}>{statusLabel}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setShowReceipt(true)}
            disabled={!canPrint}
            variant="outline" 
            size="sm" 
            className="h-8 text-xs font-bold shadow-sm"
            title={!canPrint ? "Receipt available only after delivery" : "Print repair receipt"}
          >
            <Printer className="h-3.5 w-3.5 mr-2" /> Print Receipt
          </Button>
          <Button onClick={handleBuyback} disabled={isPending} variant="secondary" size="sm" className="h-8 text-xs font-bold shadow-sm bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 border-amber-500/20 border"><ArrowRightLeft className="h-3.5 w-3.5 mr-2" /> Convert to Trade-in</Button>
        </div>
      </div>

      {/* Receipt Modal */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden h-[95vh] flex flex-col border-none shadow-2xl">
          <DialogTitle className="sr-only">Repair Receipt</DialogTitle>
          <AcceptanceReceiptView acceptance={acceptance} />
        </DialogContent>
      </Dialog>
    </>
  )
}