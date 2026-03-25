"use client"

import { useState } from "react"
import { Printer, ArrowRightLeft, Activity, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PrintableDialog } from "@/components/shared/printable-dialog"
import { Acceptance } from "../../acceptance.schema"
import { toast } from "sonner"
import { useUpdateAcceptance } from "../../acceptance.api"
import { REPAIR_STATUSES, getStatusColors, STATUS_COLORS } from "../../acceptance.constants"
import { AcceptanceInvoiceView } from "./acceptance-invoice-view"

interface TicketHeaderProps {
  acceptance: Acceptance
}

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

  const badgeColor = getStatusColors(acceptance.currentStatus as keyof typeof STATUS_COLORS)

  return (
    <>
      <div className="flex items-center justify-between px-6 py-3 bg-background border-b shadow-sm rounded-t-lg pr-12">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-lg font-black tracking-tight">#{acceptance.acceptanceNumber}</h2>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Date: {new Date(acceptance.acceptanceDate).toLocaleDateString()}</p>
          </div>
          <div className={`ml-4 flex items-center ${badgeColor.bg} border ${badgeColor.accent} rounded-md px-3 py-1`}>
            <Activity className={`h-3.5 w-3.5 ${badgeColor.text} mr-2`} />
            <span className={`text-xs font-black uppercase tracking-widest ${badgeColor.text}`}>{badgeColor.label}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleBuyback} disabled={isPending} variant="secondary" size="sm" className="h-8 text-xs font-bold shadow-sm bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 border-amber-500/20 border"><ArrowRightLeft className="h-3.5 w-3.5 mr-2" /> Convert to Trade-in</Button>
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
        </div>
      </div>

      {/* Invoice Modal */}
      <PrintableDialog
        isOpen={showReceipt}
        onOpenChange={setShowReceipt}
        title="Repair Invoice"
        icon={<FileText className="h-4 w-4 text-primary" />}
        className="max-w-4xl p-0 overflow-hidden h-[95vh] flex flex-col border-none shadow-2xl"
        printableElementId="printable-invoice"
      >
        <AcceptanceInvoiceView acceptance={acceptance} />
      </PrintableDialog>
    </>
  )
}