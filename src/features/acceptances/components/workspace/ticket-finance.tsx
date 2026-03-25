"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { CreditCard, Wrench, Trash2 } from "lucide-react"
import { Acceptance } from "../../acceptance.schema"
import { CurrencyText } from "@/components/shared/data-table-cells"
import { Button } from "@/components/ui/button"
import { useUpdateAcceptance } from "../../acceptance.api"
import { createOperationalLog, createTimelineLog, getIconForAction, prependLog } from "../../acceptance-logging"
import { toast } from "sonner"

interface TicketFinanceProps {
  acceptance: Acceptance
  onUpdate?: (updatedAcceptance: Acceptance) => void
}

export function TicketFinance({ acceptance, onUpdate }: TicketFinanceProps) {
  const { mutate: updateTicket } = useUpdateAcceptance()
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string
    message: string
    actionLabel: string
    actionColor: string
    onConfirm: () => void
  } | null>(null)

  const confirmAction = (
    title: string,
    message: string,
    actionLabel: string,
    actionColor: string,
    onConfirm: () => void
  ) => {
    setConfirmConfig({ title, message, actionLabel, actionColor, onConfirm })
    setShowConfirmDialog(true)
  }

  const handleRemovePart = (indexToRemove: number) => {
    const removedPart = acceptance.partsUsed?.[indexToRemove]
    
    confirmAction(
      "Remove Part?",
      `Are you sure you want to remove ${removedPart?.name} (₹${removedPart?.price.toLocaleString('en-IN')}) from the parts list? This action will be logged in the audit trail.`,
      "Yes, Remove",
      "bg-destructive",
      () => executeRemovePart(indexToRemove)
    )
  }

  const executeRemovePart = (indexToRemove: number) => {
    const removedPart = acceptance.partsUsed?.[indexToRemove]
    const updatedParts = acceptance.partsUsed?.filter((_, i) => i !== indexToRemove) || []
    const newTotal = (acceptance.estimatedPrice || 0) + updatedParts.reduce((acc, p) => acc + p.price * p.quantity, 0)
    const newBalance = newTotal - (acceptance.advancePayment || 0)

    // Create operational log for audit trail
    const operationalLog = createOperationalLog(
      "PART_REMOVED",
      `Part removed from bill: ${removedPart?.name} (₹${removedPart?.price.toLocaleString('en-IN')})`,
      "current-user-id",
      { itemName: removedPart?.name, itemPrice: removedPart?.price, newTotal }
    )

    // Create timeline log for visibility in workflow
    const timelineLog = createTimelineLog(
      "PART_REMOVED",
      `Part removed: ${removedPart?.name} (₹${removedPart?.price.toLocaleString('en-IN')})`,
      getIconForAction("PART_REMOVED"),
      "red",
      "current-user-id",
      undefined,
      {
        totalCost: newTotal,
        advancePayment: acceptance.advancePayment || 0,
        balanceDue: newBalance,
      }
    )

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {
      partsUsed: updatedParts,
      totalCost: newTotal,
      balanceDue: newBalance,
      operationalLogs: prependLog(acceptance.operationalLogs || [], operationalLog),
      timelineLogs: prependLog(acceptance.timelineLogs || [], timelineLog)
    }

    updateTicket({ 
      id: acceptance.id as string, 
      data
    }, {
      onSuccess: (updated) => {
        onUpdate?.(updated)
        toast.success("Part removed successfully")
      },
      onError: () => {
        toast.error("Failed to remove part")
      }
    })
  }

  const totalPartsPrice = acceptance.partsUsed?.reduce((acc, p) => acc + p.price * p.quantity, 0) || 0

  return (
    <>
      <Card className="shadow-sm border-border overflow-hidden">
      <CardHeader className="border-b">
        <CardTitle className="text-xs flex items-center justify-between uppercase tracking-widest text-muted-foreground font-black">
          <span className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-emerald-500" /> Financials</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-5 space-y-4 border-b">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground font-medium">Estimated Cost</span>
            <span className="font-bold"><CurrencyText amount={acceptance.estimatedPrice || 0} /></span>
          </div>
        </div>

        {/* Parts Section */}
        <div className="p-5 bg-muted/20 border-b">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 mb-4"><Wrench className="h-3 w-3" /> Parts Used</p>
          {acceptance.partsUsed?.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6 italic bg-background rounded-lg border border-dashed">No parts added yet.</p>
          ) : (
            <ul className="space-y-2">
              {acceptance.partsUsed?.map((part, i) => (
                <li key={i} className="flex justify-between items-center text-xs p-3 bg-background border rounded-lg shadow-sm group hover:border-destructive/30 transition-colors">
                  <span className="font-medium">{part.name} <span className="text-muted-foreground">x{part.quantity}</span></span>
                  <div className="flex items-center gap-3">
                    <span className="font-bold"><CurrencyText amount={part.price} /></span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemovePart(i)}
                      title="Remove this part"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Costs Summary */}
        <div className="p-5 space-y-4">
          {totalPartsPrice > 0 && (
            <div className="flex justify-between items-center text-sm pb-3 border-b border-dashed">
              <span className="text-muted-foreground font-medium">Parts Subtotal</span>
              <span className="font-bold text-blue-600"><CurrencyText amount={totalPartsPrice} /></span>
            </div>
          )}
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground font-medium">Total Cost (Parts + Service)</span>
            <span className="font-bold"><CurrencyText amount={acceptance.totalCost || acceptance.estimatedPrice || 0} /></span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground font-medium">Advance Paid</span>
            <span className="font-bold text-emerald-600"><CurrencyText amount={acceptance.advancePayment || 0} /></span>
          </div>
          {(acceptance.finalPayment || 0) > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-medium">Final Payment</span>
              <span className="font-bold text-emerald-600"><CurrencyText amount={acceptance.finalPayment || 0} /></span>
            </div>
          )}
          <div className="flex justify-between items-center pt-3 border-t border-dashed">
            <span className="font-black uppercase text-xs tracking-widest text-muted-foreground">Balance Due</span>
            <span className={`font-black text-2xl ${((acceptance.totalCost || 0) - (acceptance.advancePayment || 0) - (acceptance.finalPayment || 0)) > 0 ? 'text-destructive' : 'text-emerald-600'}`}>
              <CurrencyText amount={Math.max(0, (acceptance.totalCost || 0) - (acceptance.advancePayment || 0) - (acceptance.finalPayment || 0))} />
            </span>
          </div>
        </div>
      </CardContent>
      </Card>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmConfig?.title}</DialogTitle>
            <DialogDescription>
              {confirmConfig?.message}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
            <Button onClick={() => {
              confirmConfig?.onConfirm();
              setShowConfirmDialog(false);
            }} className={`${confirmConfig?.actionColor} hover:opacity-90 text-white`}>
              {confirmConfig?.actionLabel}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}