"use client"

import { useState, useRef, useEffect } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { useSession } from "next-auth/react"
import { useUpdateAcceptance } from "../../acceptance.api"
import { useUserOptions } from "@/features/users/user.api"
import { useShopProfile } from "@/features/shop-profile/shop-profile.api"
import { ItemSelectField } from "@/features/items/components/item-select-field"
import type { ItemOption } from "@/features/items/item.api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { History, MessageSquarePlus, Send, UserPlus, CheckCircle, Wrench, CreditCard, Clock, XCircle, PackageCheck, Receipt, UserCheck, ArrowRight, Plus, MoreVertical, Printer, Trash2 } from "lucide-react"
import { Acceptance } from "../../acceptance.schema"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { CurrencyText } from "@/components/shared/data-table-cells"
import { REPAIR_STATUSES } from "../../acceptance.constants"
import { PrintableDialog } from "@/components/shared/printable-dialog"
import { AcceptanceInvoiceView } from "./acceptance-invoice-view"
import { 
  createOperationalLog, 
  createTimelineLog, 
  getIconForAction, 
  getColorForStatus,
  prependLog 
} from "../../acceptance-logging"

type InvoiceType = "PENDING" | "IN_PROGRESS" | "READY" | "DELIVERY"

// Map icon names to icon components
const iconMap: Record<string, React.ComponentType<{ className: string }>> = {
  "receipt": Receipt,
  "user-check": UserCheck,
  "arrow-right": ArrowRight,
  "check-circle": CheckCircle,
  "wrench": Wrench,
};

export function TicketTimeline({ 
  acceptance,
  onUpdate,
}: { 
  acceptance: Acceptance
  onUpdate?: (updatedAcceptance: Acceptance) => void
}) {
  const [isAdding, setIsAdding] = useState(false)
  const [note, setNote] = useState("")
  const [selectedTech, setSelectedTech] = useState("")
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showAddPartDialog, setShowAddPartDialog] = useState(false)
  const [isCheckoutMode, setIsCheckoutMode] = useState(false)
  const [partName, setPartName] = useState("")
  const [partPrice, setPartPrice] = useState("")
  const [selectedItemId, setSelectedItemId] = useState<string>("")
  const [useManualEntry, setUseManualEntry] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "check" | "bank_transfer">("cash")
  const [paymentAmount, setPaymentAmount] = useState<string>("")
  const [discountAmount, setDiscountAmount] = useState<string>("0")
  const [paymentNotes, setPaymentNotes] = useState("")
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false)
  const [selectedInvoiceType, setSelectedInvoiceType] = useState<InvoiceType>("DELIVERY")
  const [invoiceSnapshot, setInvoiceSnapshot] = useState<Record<string, any> | null>(null)
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string
    message: string
    actionLabel: string
    actionColor: string
    onConfirm: () => void
  } | null>(null)
  const activeHeadRef = useRef<HTMLDivElement>(null)
  const noteInputRef = useRef<HTMLTextAreaElement>(null)
  
  // Auto-focus note input when adding
  useEffect(() => {
    if (isAdding && noteInputRef.current) {
      noteInputRef.current.focus()
    }
  }, [isAdding])
  
  // Form for part selection
  const partForm = useForm<{ selectedPart: string }>({
    defaultValues: { selectedPart: "" }
  })

  const { mutate: updateTicket, isPending } = useUpdateAcceptance()
  const { data: session } = useSession()
  const currentUserId = session?.user?.id || "anonymous"
  const currentUserName = session?.user?.name || "System"
  const { data: users } = useUserOptions()
  const { data: shopProfile } = useShopProfile()

  // Handle part selection to auto-populate name and price
  const handlePartSelect = (selectedOption: ItemOption) => {
    setSelectedItemId(selectedOption.id)
    setPartName(selectedOption.name)
    setPartPrice((selectedOption.salePrice as string | number)?.toString() || "0")
    // Clear the dropdown selection after values are populated
    partForm.setValue("selectedPart", "")
  }

  // Helper to show confirmation dialog before executing action
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

  // Helper to get historical status based on invoice type
  const getStatusForInvoiceType = (invoiceType: InvoiceType): string => {
    switch(invoiceType) {
      case "PENDING": return "PENDING";
      case "IN_PROGRESS": return "IN_PROGRESS";
      case "READY": return "READY";
      case "DELIVERY": return "DELIVERED";
      default: return "PENDING";
    }
  };

  // Helper to open invoice print dialog
  const openInvoicePrint = (type: InvoiceType, snapshot?: Record<string, any>) => {
    setSelectedInvoiceType(type)
    setInvoiceSnapshot(snapshot || null)
    setInvoiceDialogOpen(true)
  }

  // Auto-scroll to active workflow head when timeline changes
  useEffect(() => {
    if (activeHeadRef.current) {
      activeHeadRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [acceptance.timelineLogs?.length, acceptance.currentStatus])

  // Pre-select technician if already assigned to ticket
  useEffect(() => {
    if (acceptance.technicianId) {
      setSelectedTech(acceptance.technicianId)
    }
  }, [acceptance.technicianId])

  // Get parts only from inventory

  const handleAddNote = () => {
    if (!note.trim()) return;
    const operationalLog = createOperationalLog(
      "NOTE_ADDED",
      note,
      currentUserId,
      { userName: currentUserName }
    );
    const timelineLog = createTimelineLog(
      "NOTE_ADDED",
      note,
      getIconForAction("NOTE_ADDED"),
      "blue",
      currentUserId,
      undefined,
      { userName: currentUserName }
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = { 
        operationalLogs: prependLog(acceptance.operationalLogs || [], operationalLog),
        timelineLogs: prependLog(acceptance.timelineLogs || [], timelineLog)
    };
    updateTicket({ 
      id: acceptance.id as string, 
      data
    }, {
      onSuccess: (updatedAcceptance) => {
        setNote("");
        setIsAdding(false);
        onUpdate?.(updatedAcceptance);
        toast.success("Note added successfully");
      }
    })
  }

  const handleAssignTech = () => {
    if (!selectedTech) return toast.error("Please select a technician");
    const techName = users?.find(u => u.id === selectedTech)?.name || "Technician";
    
    confirmAction(
      "Assign Technician?",
      `Assign this ticket to ${techName} and start diagnosis?`,
      "Yes, Assign & Start",
      "bg-blue-600",
      () => {
        const operationalLog = createOperationalLog(
          "TECHNICIAN_ASSIGNED",
          `Ticket assigned to ${techName}. Status changed to Diagnosing.`,
          "current-user-id",
          { technicianId: selectedTech, technicianName: techName }
        );
        const timelineLog = createTimelineLog(
          "TECHNICIAN_ASSIGNED",
          `Assigned to ${techName}`,
          getIconForAction("TECHNICIAN_ASSIGNED"),
          getColorForStatus(REPAIR_STATUSES.DIAGNOSING),
          "current-user-id"
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any = { 
            technicianId: selectedTech, 
            currentStatus: REPAIR_STATUSES.DIAGNOSING,
            operationalLogs: prependLog(acceptance.operationalLogs || [], operationalLog),
            timelineLogs: prependLog(acceptance.timelineLogs || [], timelineLog)
        };
        updateTicket({ 
          id: acceptance.id as string, 
          data
        }, { onSuccess: (updated) => {
          onUpdate?.(updated);
          toast.success("Technician assigned!");
        } })
      }
    )
  }

  const handleStartRepair = () => {
    confirmAction(
      "Start Repair Work?",
      "Mark this device as In Progress and begin repair work?",
      "Yes, Start Repair",
      "bg-indigo-600",
      () => {
        const operationalLog = createOperationalLog(
          "STATUS_CHANGED",
          "Repair work started. Device moved to In Progress.",
          "current-user-id",
          { fromStatus: REPAIR_STATUSES.DIAGNOSING, toStatus: REPAIR_STATUSES.IN_PROGRESS }
        );
        const timelineLog = createTimelineLog(
          "STATUS_CHANGED",
          `Status changed to In Progress`,
          getIconForAction("STATUS_CHANGED"),
          getColorForStatus(REPAIR_STATUSES.IN_PROGRESS),
          "current-user-id"
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any = { 
            currentStatus: REPAIR_STATUSES.IN_PROGRESS,
            operationalLogs: prependLog(acceptance.operationalLogs || [], operationalLog),
            timelineLogs: prependLog(acceptance.timelineLogs || [], timelineLog)
        };
        updateTicket({ 
          id: acceptance.id as string, 
          data
        }, { onSuccess: (updated) => {
          onUpdate?.(updated);
          toast.success("Repair started!");
        } })
      }
    )
  }

  const handleMarkReady = () => {
    confirmAction(
      "Mark Device as Ready?",
      "Complete repair work and mark this device as Ready for delivery? Payment will be required before handover.",
      "Yes, Mark Ready",
      "bg-emerald-600",
      () => {
        const operationalLog = createOperationalLog(
          "STATUS_CHANGED",
          "Device repair completed and marked as Ready for delivery.",
          "current-user-id",
          { fromStatus: acceptance.currentStatus, toStatus: REPAIR_STATUSES.READY }
        );
        const timelineLog = createTimelineLog(
          "STATUS_CHANGED",
          `Status changed to Ready`,
          getIconForAction("STATUS_CHANGED"),
          getColorForStatus(REPAIR_STATUSES.READY),
          "current-user-id"
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any = { 
            currentStatus: REPAIR_STATUSES.READY,
            operationalLogs: prependLog(acceptance.operationalLogs || [], operationalLog),
            timelineLogs: prependLog(acceptance.timelineLogs || [], timelineLog)
        };
        updateTicket({ 
          id: acceptance.id as string, 
          data
        }, { onSuccess: (updated) => {
          onUpdate?.(updated);
          toast.success("Device marked as Ready!");
        } })
      }
    )
  }

  // Currency configuration from shop profile
  const currency = shopProfile?.currency || "BDT"
  
  // Calculate payment amounts for checkout
  const dueAmount = acceptance.balanceDue || 0
  const paidAmount = parseFloat(paymentAmount) || 0
  const discount = parseFloat(discountAmount) || 0
  const adjustedTotal = Math.max(0, dueAmount - discount)
  const changeAmount = Math.max(0, paidAmount - adjustedTotal)
  const remainingDue = Math.max(0, adjustedTotal - paidAmount)

  const handleCheckout = () => {
    setPaymentAmount(String(acceptance.balanceDue || 0))
    setIsCheckoutMode(true)
    setShowConfirmDialog(true)
  }

  const handleCheckoutSubmit = () => {
    if (!paymentAmount || isNaN(parseFloat(paymentAmount))) {
      toast.error("Please enter a valid payment amount")
      return
    }

    // Format currency display based on locale
    const currencyFormatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    })

    const operationalLog = createOperationalLog(
      "DELIVERY_COMPLETED",
      `Payment collected via ${paymentMethod}: ${currencyFormatter.format(paidAmount)}${discount > 0 ? ` (Discount: ${currencyFormatter.format(discount)})` : ''}. Remaining due: ${currencyFormatter.format(remainingDue)}. Device delivered to customer.`,
      "current-user-id",
      { paymentMethod, amountCollected: paidAmount, discount, notes: paymentNotes }
    );
    const timelineLog = createTimelineLog(
      "DELIVERY_COMPLETED",
      "Device delivered and payment complete",
      getIconForAction("DELIVERY_COMPLETED"),
      getColorForStatus(REPAIR_STATUSES.DELIVERED),
      "current-user-id"
    );
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = { 
      finalPayment: (acceptance.finalPayment || 0) + paidAmount, 
      balanceDue: remainingDue,
      currentStatus: REPAIR_STATUSES.DELIVERED,
      operationalLogs: prependLog(acceptance.operationalLogs || [], operationalLog),
      timelineLogs: prependLog(acceptance.timelineLogs || [], timelineLog)
    };

    updateTicket({ 
      id: acceptance.id as string, 
      data
    }, { onSuccess: (updated) => {
      setShowConfirmDialog(false)
      setIsCheckoutMode(false)
      setPaymentAmount("")
      setDiscountAmount("0")
      setPaymentNotes("")
      setPaymentMethod("cash")
      onUpdate?.(updated)
      toast.success("Payment collected and device delivered!")
      // TODO: Generate invoice and navigate to print
    } })
  }

  const handlePauseRepair = () => {
    confirmAction(
      "Pause Repair for Parts?",
      "Pause repair work while waiting for required parts to arrive?",
      "Yes, Pause Repair",
      "bg-amber-600",
      () => {
        const operationalLog = createOperationalLog(
          "STATUS_CHANGED",
          "Repair on hold. Waiting for required parts.",
          "current-user-id",
          { fromStatus: acceptance.currentStatus, toStatus: REPAIR_STATUSES.WAITING_PARTS }
        );
        const timelineLog = createTimelineLog(
          "STATUS_CHANGED",
          "Status changed to Waiting Parts",
          getIconForAction("STATUS_CHANGED"),
          getColorForStatus(REPAIR_STATUSES.WAITING_PARTS),
          "current-user-id"
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any = { 
            currentStatus: REPAIR_STATUSES.WAITING_PARTS, 
            operationalLogs: prependLog(acceptance.operationalLogs || [], operationalLog),
            timelineLogs: prependLog(acceptance.timelineLogs || [], timelineLog)
        };
        updateTicket({ 
          id: acceptance.id as string, 
          data
        }, { onSuccess: (updated) => {
          onUpdate?.(updated);
          toast.success("Repair paused");
        } })
      }
    )
  }

  const handleResumeRepair = () => {
    confirmAction(
      "Resume Repair from Parts?",
      "Parts have arrived. Resume diagnosis or repair work?",
      "Yes, Resume Repair",
      "bg-amber-600",
      () => {
        const operationalLog = createOperationalLog(
          "STATUS_CHANGED",
          "Parts arrived. Resuming diagnosis/repair.",
          "current-user-id",
          { fromStatus: acceptance.currentStatus, toStatus: REPAIR_STATUSES.DIAGNOSING }
        );
        const timelineLog = createTimelineLog(
          "STATUS_CHANGED",
          "Status changed to Diagnosing",
          getIconForAction("STATUS_CHANGED"),
          getColorForStatus(REPAIR_STATUSES.DIAGNOSING),
          "current-user-id"
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any = { 
            currentStatus: REPAIR_STATUSES.DIAGNOSING, 
            operationalLogs: prependLog(acceptance.operationalLogs || [], operationalLog),
            timelineLogs: prependLog(acceptance.timelineLogs || [], timelineLog)
        };
        updateTicket({ 
          id: acceptance.id as string, 
          data
        }, { onSuccess: (updated) => {
          onUpdate?.(updated);
          toast.success("Repair resumed");
        } })
      }
    )
  }

  const handleOnHold = () => {
    confirmAction(
      "Put Device on Hold?",
      "Put this device on hold awaiting customer decision or approval to proceed?",
      "Yes, Put on Hold",
      "bg-amber-600",
      () => {
        const operationalLog = createOperationalLog(
          "STATUS_CHANGED",
          "Device put on hold. Awaiting customer decision or action.",
          "current-user-id",
          { fromStatus: acceptance.currentStatus, toStatus: REPAIR_STATUSES.ON_HOLD }
        );
        const timelineLog = createTimelineLog(
          "STATUS_CHANGED",
          "Status changed to On Hold",
          getIconForAction("STATUS_CHANGED"),
          getColorForStatus(REPAIR_STATUSES.ON_HOLD),
          "current-user-id"
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any = { 
            currentStatus: REPAIR_STATUSES.ON_HOLD, 
            operationalLogs: prependLog(acceptance.operationalLogs || [], operationalLog),
            timelineLogs: prependLog(acceptance.timelineLogs || [], timelineLog)
        };
        updateTicket({ 
          id: acceptance.id as string, 
          data
        }, { onSuccess: (updated) => {
          onUpdate?.(updated);
          toast.success("Device put on hold");
        } })
      }
    )
  }

  const handleResumeFromOnHold = () => {
    confirmAction(
      "Resume Work on Device?",
      "Customer has approved. Resume diagnosis and repair work?",
      "Yes, Resume Work",
      "bg-amber-600",
      () => {
        const operationalLog = createOperationalLog(
          "STATUS_CHANGED",
          "Resumed work on device. Customer approval received.",
          "current-user-id",
          { fromStatus: REPAIR_STATUSES.ON_HOLD, toStatus: REPAIR_STATUSES.DIAGNOSING }
        );
        const timelineLog = createTimelineLog(
          "STATUS_CHANGED",
          "Resumed from hold",
          getIconForAction("STATUS_CHANGED"),
          getColorForStatus(REPAIR_STATUSES.DIAGNOSING),
          "current-user-id"
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any = { 
            currentStatus: REPAIR_STATUSES.DIAGNOSING, 
            operationalLogs: prependLog(acceptance.operationalLogs || [], operationalLog),
            timelineLogs: prependLog(acceptance.timelineLogs || [], timelineLog)
        };
        updateTicket({ 
          id: acceptance.id as string, 
          data
        }, { onSuccess: (updated) => {
          onUpdate?.(updated);
          toast.success("Repair resumed from hold");
        } })
      }
    )
  }

  const handleMarkUnrepairable = () => {
    confirmAction(
      "Mark Device as Unrepairable?",
      "Mark this device as unrepairable and prepare for return to customer? This cannot be easily undone.",
      "Yes, Mark Unrepairable",
      "bg-red-600",
      () => {
        const operationalLog = createOperationalLog(
          "STATUS_CHANGED",
          "Device marked as unrepairable. Ready to return to customer.",
          "current-user-id",
          { fromStatus: acceptance.currentStatus, toStatus: REPAIR_STATUSES.UNREPAIRABLE }
        );
        const timelineLog = createTimelineLog(
          "STATUS_CHANGED",
          "Status changed to Unrepairable",
          getIconForAction("STATUS_CHANGED"),
          getColorForStatus(REPAIR_STATUSES.UNREPAIRABLE),
          "current-user-id"
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any = { 
            currentStatus: REPAIR_STATUSES.UNREPAIRABLE, 
            operationalLogs: prependLog(acceptance.operationalLogs || [], operationalLog),
            timelineLogs: prependLog(acceptance.timelineLogs || [], timelineLog)
        };
        updateTicket({ 
          id: acceptance.id as string, 
          data
        }, { onSuccess: (updated) => {
          onUpdate?.(updated);
          toast.error("Device marked as unrepairable");
        } })
      }
    )
  }

  const handleReturnUnrepairable = () => {
    confirmAction(
      "Return Device to Customer?",
      "Return this unrepairable device to the customer? Ticket will be marked as complete.",
      "Yes, Return Device",
      "bg-emerald-600",
      () => {
        const operationalLog = createOperationalLog(
          "DELIVERY_COMPLETED",
          "Unrepairable device returned to customer.",
          "current-user-id",
          { reason: "unrepairable_return" }
        );
        const timelineLog = createTimelineLog(
          "DELIVERY_COMPLETED",
          "Device returned to customer",
          getIconForAction("DELIVERY_COMPLETED"),
          getColorForStatus(REPAIR_STATUSES.DELIVERED),
          "current-user-id"
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any = { 
            currentStatus: REPAIR_STATUSES.DELIVERED, 
            balanceDue: 0, 
            operationalLogs: prependLog(acceptance.operationalLogs || [], operationalLog),
            timelineLogs: prependLog(acceptance.timelineLogs || [], timelineLog)
        };
        updateTicket({ 
          id: acceptance.id as string, 
          data
        }, { onSuccess: (updated) => {
          onUpdate?.(updated);
          toast.success("Device returned to customer");
        } })
      }
    )
  }

  const handleConfirmCancel = () => {
    setShowConfirmDialog(false);
    const operationalLog = createOperationalLog(
      "STATUS_CHANGED",
      "Repair cancelled by user request.",
      "current-user-id",
      { fromStatus: acceptance.currentStatus, toStatus: REPAIR_STATUSES.CANCELLED }
    );
    const timelineLog = createTimelineLog(
      "STATUS_CHANGED",
      "Repair cancelled",
      getIconForAction("STATUS_CHANGED"),
      getColorForStatus(REPAIR_STATUSES.CANCELLED),
      "current-user-id"
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = { 
        currentStatus: REPAIR_STATUSES.CANCELLED, 
        operationalLogs: prependLog(acceptance.operationalLogs || [], operationalLog),
        timelineLogs: prependLog(acceptance.timelineLogs || [], timelineLog)
    };
    updateTicket({ 
      id: acceptance.id as string, 
      data
    }, { onSuccess: (updated) => {
      onUpdate?.(updated);
      toast.error("Repair cancelled");
    } })
  }

  const handleRequestCancel = () => {
    confirmAction(
      "Cancel Repair?",
      "Are you sure you want to cancel this repair? This action cannot be easily undone.",
      "Yes, Cancel Repair",
      "bg-red-600",
      handleConfirmCancel
    )
  }

  const handleReturnCancelled = () => {
    confirmAction(
      "Return Device to Customer?",
      "Return this cancelled ticket's device to the customer? Ticket will be marked as complete.",
      "Yes, Return Device",
      "bg-emerald-600",
      () => {
        const operationalLog = createOperationalLog(
          "DELIVERY_COMPLETED",
          "Unrepaired device returned to customer.",
          "current-user-id",
          { reason: "unrepaired_return" }
        );
        const timelineLog = createTimelineLog(
          "DELIVERY_COMPLETED",
          "Device returned to customer",
          getIconForAction("DELIVERY_COMPLETED"),
          getColorForStatus(REPAIR_STATUSES.DELIVERED),
          "current-user-id"
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any = { 
            currentStatus: REPAIR_STATUSES.DELIVERED, 
            balanceDue: 0, 
            operationalLogs: prependLog(acceptance.operationalLogs || [], operationalLog),
            timelineLogs: prependLog(acceptance.timelineLogs || [], timelineLog)
        };
        updateTicket({ 
          id: acceptance.id as string, 
          data
        }, { onSuccess: (updated) => {
          onUpdate?.(updated);
          toast.success("Device returned");
        } })
      }
    )
  }

  const handleAddPart = () => {
    if (!partName || !partPrice) return toast.error("Please enter part name and price");
    const price = parseFloat(partPrice);
    const newPart = { itemId: selectedItemId || `item-${Date.now()}`, name: partName, quantity: 1, price };
    const updatedParts = [...(acceptance.partsUsed || []), newPart];
    const newTotal = (acceptance.estimatedPrice || 0) + updatedParts.reduce((acc, p) => acc + p.price * p.quantity, 0);
    const newBalance = newTotal - (acceptance.advancePayment || 0);
    
    // Create operational log for audit trail
    const operationalLog = createOperationalLog(
      "PART_ADDED",
      `Part added to bill: ${partName} (₹${price.toLocaleString('en-IN')})`,
      "current-user-id",
      { itemName: partName, itemPrice: price, newTotal }
    );
    
    // Create timeline log for visibility in workflow
    const timelineLog = createTimelineLog(
      "PART_ADDED",
      `Part added: ${partName} (₹${price.toLocaleString('en-IN')})`,
      getIconForAction("PART_ADDED"),
      "blue",
      "current-user-id"
    );
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = { 
      partsUsed: updatedParts, 
      totalCost: newTotal, 
      balanceDue: newBalance,
      operationalLogs: prependLog(acceptance.operationalLogs || [], operationalLog),
      timelineLogs: prependLog(acceptance.timelineLogs || [], timelineLog)
    };
    updateTicket({ 
      id: acceptance.id as string, 
      data
    }, {
      onSuccess: (updatedAcceptance) => { 
        setShowAddPartDialog(false); 
        setPartName(""); 
        setPartPrice(""); 
        setSelectedItemId("");
        setUseManualEntry(false);
        onUpdate?.(updatedAcceptance);
        toast.success("Part added to bill"); 
      }
    })
  }

  const isDelivered = acceptance.currentStatus === REPAIR_STATUSES.DELIVERED;
  const isTradedIn = acceptance.currentStatus === REPAIR_STATUSES.TRADE_IN;
  const showActiveHead = !isDelivered && !isTradedIn;

  // Handle delete note
  const handleDeleteNote = (logId: string) => {
    confirmAction(
      "Delete Note?",
      "Are you sure you want to delete this note? This action cannot be undone.",
      "Yes, Delete",
      "bg-red-600",
      () => {
        const updatedLogs = (acceptance.timelineLogs || []).filter(log => log.id !== logId);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any = {
          timelineLogs: updatedLogs,
          operationalLogs: acceptance.operationalLogs || []
        };
        updateTicket({
          id: acceptance.id as string,
          data
        }, {
          onSuccess: (updated) => {
            onUpdate?.(updated);
            toast.success("Note deleted");
          }
        });
      }
    );
  }

  return (
    <>
    <Card className="shadow-sm border-border">
      <CardHeader className="border-b px-5">
        <div className="flex flex-row items-center justify-between">
          <CardTitle className="text-xs flex items-center gap-2 uppercase tracking-widest text-muted-foreground font-black">
            <History className="h-4 w-4 text-blue-500" /> Workflow & Timeline
          </CardTitle>
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => confirmAction(
                  "Cancel Ticket?",
                  "Are you sure you want to cancel this ticket? This action cannot be undone.",
                  "Cancel Ticket",
                  "bg-red-600 hover:bg-red-700",
                  handleRequestCancel
                )}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Ticket
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3">
        
        <div className="space-y-3 border-l-2 border-muted ml-3 pl-6 relative">
          
          {/* ACTIVE WORKFLOW HEAD (THE STUCK POINT) */}
          {showActiveHead && (
            <div ref={activeHeadRef} className="relative mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="absolute -left-[31px] top-2 h-3 w-3 rounded-full bg-background border-2 border-primary ring-4 ring-background animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
              <p className="text-[10px] uppercase font-black tracking-widest text-primary mb-2 flex items-center gap-2">
                Next Step / Action Required
              </p>
              <div className="bg-card rounded-2xl shadow-lg border-2 border-primary/20 overflow-hidden">
                
                {acceptance.currentStatus === REPAIR_STATUSES.PENDING && (
                  <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 space-y-2">
                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold text-sm">
                      <UserPlus className="h-4 w-4" /> Assign Technician
                    </div>
                    <p className="text-xs text-blue-600/80 dark:text-blue-400/80">This ticket is currently unassigned. Please assign a tech to start diagnosis.</p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <select className="h-9 px-3 rounded-md border border-blue-200 bg-white dark:bg-background text-sm flex-1 min-w-[200px]" value={selectedTech} onChange={e => setSelectedTech(e.target.value)}>
                        <option value="">Select Technician...</option>
                        {users?.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                      </select>
                      <Button onClick={handleAssignTech} disabled={isPending} className="h-9 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">Assign & Start</Button>
                    </div>
                  </div>
                )}

                {acceptance.currentStatus === REPAIR_STATUSES.DIAGNOSING && (
                  <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 space-y-2">
                    <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-sm">
                      <Wrench className="h-4 w-4" /> Diagnosis Complete
                    </div>
                    <p className="text-xs text-indigo-600/80 dark:text-indigo-400/80">Device diagnosis is done. Start the repair work or mark as unrepairable.</p>
                    {showAddPartDialog && (
                      <FormProvider {...partForm}>
                        <div className="flex flex-col gap-2 p-3 bg-background border rounded-lg shadow-sm">
                          {!useManualEntry ? (
                            <>
                              <ItemSelectField
                                name="selectedPart"
                                control={partForm.control}
                                type="PART"
                                inStock={true}
                                extras={["salePrice"]}
                                placeholder="Search parts..."
                                onSelectOption={handlePartSelect}
                              />
                              {partName && (
                                <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-950/30 rounded border border-blue-200 dark:border-blue-900 text-xs">
                                  <div>
                                    <p className="font-semibold text-blue-900 dark:text-blue-100">{partName}</p>
                                    <p className="text-blue-700 dark:text-blue-300">₹ {parseFloat(partPrice || "0").toLocaleString('en-IN')}</p>
                                  </div>
                                  <button 
                                    type="button" 
                                    onClick={() => {
                                      setPartName("");
                                      setPartPrice("");
                                      setSelectedItemId("");
                                      partForm.reset();
                                    }}
                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-200"
                                  >
                                    ✕
                                  </button>
                                </div>
                              )}
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 text-[9px] text-muted-foreground"
                                onClick={() => setUseManualEntry(true)}
                              >
                                Can&apos;t find? Use custom name
                              </Button>
                            </>
                          ) : (
                            <>
                              <input type="text" placeholder="Part name (custom)" value={partName} onChange={e => setPartName(e.target.value)} className="w-full text-xs p-2 rounded border" />
                              <input type="number" placeholder="Price" value={partPrice} onChange={e => setPartPrice(e.target.value)} className="w-full text-xs p-2 rounded border" />
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 text-[9px] text-muted-foreground"
                                onClick={() => {
                                  setUseManualEntry(false);
                                  setPartName("");
                                  setPartPrice("");
                                  partForm.reset();
                                }}
                              >
                                Use inventory lookup
                              </Button>
                            </>
                          )}
                          <div className="flex justify-end gap-2 mt-1">
                            <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={() => {
                              setShowAddPartDialog(false);
                              partForm.reset();
                            }}>Cancel</Button>
                            <Button size="sm" className="h-7 text-[10px]" onClick={handleAddPart} disabled={isPending}>Add Part</Button>
                          </div>
                        </div>
                      </FormProvider>
                    )}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button onClick={handleStartRepair} disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"><Wrench className="h-4 w-4 mr-2"/> Start Repair</Button>
                      <Button onClick={handlePauseRepair} disabled={isPending} variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-100"><Clock className="h-4 w-4 mr-2"/> Waiting Parts</Button>
                      <Button onClick={handleOnHold} disabled={isPending} variant="outline" className="border-amber-200 text-amber-700 hover:bg-amber-50"><Clock className="h-4 w-4 mr-2"/> On Hold</Button>
                      <Button onClick={() => setShowAddPartDialog(!showAddPartDialog)} disabled={isPending} variant="outline" className="border-primary text-primary hover:bg-primary/10"><Plus className="h-4 w-4 mr-2"/> Add Part</Button>
                      <Button onClick={handleMarkUnrepairable} disabled={isPending} variant="outline" className="border-red-200 text-red-700 hover:bg-red-50"><XCircle className="h-4 w-4 mr-2"/> Unrepairable</Button>
                    </div>
                  </div>
                )}

                {acceptance.currentStatus === REPAIR_STATUSES.IN_PROGRESS && (
                  <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 space-y-2">
                    <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-sm">
                      <Wrench className="h-4 w-4" /> Repair in Progress
                    </div>
                    <p className="text-xs text-indigo-600/80 dark:text-indigo-400/80">The device is currently being repaired. Add any parts used, then mark as Ready when done.</p>
                    {showAddPartDialog && (
                      <FormProvider {...partForm}>
                        <div className="flex flex-col gap-2 p-3 bg-background border rounded-lg shadow-sm">
                          {!useManualEntry ? (
                            <>
                              <ItemSelectField
                                name="selectedPart"
                                control={partForm.control}
                                type="PART"
                                inStock={true}
                                extras={["salePrice"]}
                                placeholder="Search parts..."
                                onSelectOption={handlePartSelect}
                              />
                              {partName && (
                                <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-950/30 rounded border border-blue-200 dark:border-blue-900 text-xs">
                                  <div>
                                    <p className="font-semibold text-blue-900 dark:text-blue-100">{partName}</p>
                                    <p className="text-blue-700 dark:text-blue-300">₹ {parseFloat(partPrice || "0").toLocaleString('en-IN')}</p>
                                  </div>
                                  <button 
                                    type="button" 
                                    onClick={() => {
                                      setPartName("");
                                      setPartPrice("");
                                      setSelectedItemId("");
                                      partForm.reset();
                                    }}
                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-200"
                                  >
                                    ✕
                                  </button>
                                </div>
                              )}
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 text-[9px] text-muted-foreground"
                                onClick={() => setUseManualEntry(true)}
                              >
                                Can&apos;t find? Use custom name
                              </Button>
                            </>
                          ) : (
                            <>
                              <input type="text" placeholder="Part name (custom)" value={partName} onChange={e => setPartName(e.target.value)} className="w-full text-xs p-2 rounded border" />
                              <input type="number" placeholder="Price" value={partPrice} onChange={e => setPartPrice(e.target.value)} className="w-full text-xs p-2 rounded border" />
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 text-[9px] text-muted-foreground"
                                onClick={() => {
                                  setUseManualEntry(false);
                                  setPartName("");
                                  setPartPrice("");
                                  partForm.reset();
                                }}
                              >
                                Use inventory lookup
                              </Button>
                            </>
                          )}
                          <div className="flex justify-end gap-2 mt-1">
                            <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={() => {
                              setShowAddPartDialog(false);
                              partForm.reset();
                            }}>Cancel</Button>
                            <Button size="sm" className="h-7 text-[10px]" onClick={handleAddPart} disabled={isPending}>Add Part</Button>
                          </div>
                        </div>
                      </FormProvider>
                    )}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button onClick={handleMarkReady} disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"><CheckCircle className="h-4 w-4 mr-2"/> Mark as Ready</Button>
                      <Button onClick={handlePauseRepair} disabled={isPending} variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-100"><Clock className="h-4 w-4 mr-2"/> Waiting Parts</Button>
                      <Button onClick={() => setShowAddPartDialog(!showAddPartDialog)} disabled={isPending} variant="outline" className="border-primary text-primary hover:bg-primary/10"><Plus className="h-4 w-4 mr-2"/> Add Part</Button>
                      <Button onClick={handleMarkUnrepairable} disabled={isPending} variant="outline" className="border-red-200 text-red-700 hover:bg-red-50"><XCircle className="h-4 w-4 mr-2"/> Unrepairable</Button>
                    </div>
                  </div>
                )}

                {acceptance.currentStatus === REPAIR_STATUSES.WAITING_PARTS && (
                  <div className="p-3 bg-amber-50/80 dark:bg-amber-950/20 space-y-2">
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm">
                      <Clock className="h-4 w-4" /> On Hold: Waiting Parts
                    </div>
                    <p className="text-xs text-amber-600/80 dark:text-amber-500/80">Repair is paused until required components arrive.</p>
                    {showAddPartDialog && (
                      <FormProvider {...partForm}>
                        <div className="flex flex-col gap-2 p-3 bg-background border rounded-lg shadow-sm">
                          {!useManualEntry ? (
                            <>
                              <ItemSelectField
                                name="selectedPart"
                                control={partForm.control}
                                type="PART"
                                inStock={true}
                                extras={["salePrice"]}
                                placeholder="Search parts..."
                                onSelectOption={handlePartSelect}
                              />
                              {partName && (
                                <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-950/30 rounded border border-blue-200 dark:border-blue-900 text-xs">
                                  <div>
                                    <p className="font-semibold text-blue-900 dark:text-blue-100">{partName}</p>
                                    <p className="text-blue-700 dark:text-blue-300">₹ {parseFloat(partPrice || "0").toLocaleString('en-IN')}</p>
                                  </div>
                                  <button 
                                    type="button" 
                                    onClick={() => {
                                      setPartName("");
                                      setPartPrice("");
                                      setSelectedItemId("");
                                      partForm.reset();
                                    }}
                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-200"
                                  >
                                    ✕
                                  </button>
                                </div>
                              )}
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 text-[9px] text-muted-foreground"
                                onClick={() => setUseManualEntry(true)}
                              >
                                Can&apos;t find? Use custom name
                              </Button>
                            </>
                          ) : (
                            <>
                              <input type="text" placeholder="Part name (custom)" value={partName} onChange={e => setPartName(e.target.value)} className="w-full text-xs p-2 rounded border" />
                              <input type="number" placeholder="Price" value={partPrice} onChange={e => setPartPrice(e.target.value)} className="w-full text-xs p-2 rounded border" />
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 text-[9px] text-muted-foreground"
                                onClick={() => {
                                  setUseManualEntry(false);
                                  setPartName("");
                                  setPartPrice("");
                                  partForm.reset();
                                }}
                              >
                                Use inventory lookup
                              </Button>
                            </>
                          )}
                          <div className="flex justify-end gap-2 mt-1">
                            <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={() => {
                              setShowAddPartDialog(false);
                              partForm.reset();
                            }}>Cancel</Button>
                            <Button size="sm" className="h-7 text-[10px]" onClick={handleAddPart} disabled={isPending}>Add Part</Button>
                          </div>
                        </div>
                      </FormProvider>
                    )}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button onClick={handleResumeRepair} disabled={isPending} className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm"><Wrench className="h-4 w-4 mr-2"/> Resume Repair</Button>
                      <Button onClick={() => setShowAddPartDialog(!showAddPartDialog)} disabled={isPending} variant="outline" className="border-primary text-primary hover:bg-primary/10"><Plus className="h-4 w-4 mr-2"/> Add Part</Button>
                    </div>
                  </div>
                )}

                {acceptance.currentStatus === REPAIR_STATUSES.ON_HOLD && (
                  <div className="p-3 bg-amber-50/80 dark:bg-amber-950/20 space-y-2">
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm">
                      <Clock className="h-4 w-4" /> On Hold
                    </div>
                    <p className="text-xs text-amber-600/80 dark:text-amber-500/80">Device is on hold awaiting customer decision or approval to proceed.</p>
                    {showAddPartDialog && (
                      <FormProvider {...partForm}>
                        <div className="flex flex-col gap-2 p-3 bg-background border rounded-lg shadow-sm">
                          {!useManualEntry ? (
                            <>
                              <ItemSelectField
                                name="selectedPart"
                                control={partForm.control}
                                type="PART"
                                inStock={true}
                                extras={["salePrice"]}
                                placeholder="Search parts..."
                                onSelectOption={handlePartSelect}
                              />
                              {partName && (
                                <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-950/30 rounded border border-blue-200 dark:border-blue-900 text-xs">
                                  <div>
                                    <p className="font-semibold text-blue-900 dark:text-blue-100">{partName}</p>
                                    <p className="text-blue-700 dark:text-blue-300">₹ {parseFloat(partPrice || "0").toLocaleString('en-IN')}</p>
                                  </div>
                                  <button 
                                    type="button" 
                                    onClick={() => {
                                      setPartName("");
                                      setPartPrice("");
                                      setSelectedItemId("");
                                      partForm.reset();
                                    }}
                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-200"
                                  >
                                    ✕
                                  </button>
                                </div>
                              )}
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 text-[9px] text-muted-foreground"
                                onClick={() => setUseManualEntry(true)}
                              >
                                Can&apos;t find? Use custom name
                              </Button>
                            </>
                          ) : (
                            <>
                              <input type="text" placeholder="Part name (custom)" value={partName} onChange={e => setPartName(e.target.value)} className="w-full text-xs p-2 rounded border" />
                              <input type="number" placeholder="Price" value={partPrice} onChange={e => setPartPrice(e.target.value)} className="w-full text-xs p-2 rounded border" />
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 text-[9px] text-muted-foreground"
                                onClick={() => {
                                  setUseManualEntry(false);
                                  setPartName("");
                                  setPartPrice("");
                                  partForm.reset();
                                }}
                              >
                                Use inventory lookup
                              </Button>
                            </>
                          )}
                          <div className="flex justify-end gap-2 mt-1">
                            <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={() => {
                              setShowAddPartDialog(false);
                              partForm.reset();
                            }}>Cancel</Button>
                            <Button size="sm" className="h-7 text-[10px]" onClick={handleAddPart} disabled={isPending}>Add Part</Button>
                          </div>
                        </div>
                      </FormProvider>
                    )}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button onClick={handleResumeFromOnHold} disabled={isPending} className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm"><Wrench className="h-4 w-4 mr-2"/> Resume Work</Button>
                      <Button onClick={() => setShowAddPartDialog(!showAddPartDialog)} disabled={isPending} variant="outline" className="border-primary text-primary hover:bg-primary/10"><Plus className="h-4 w-4 mr-2"/> Add Part</Button>
                    </div>
                  </div>
                )}

                {acceptance.currentStatus === REPAIR_STATUSES.UNREPAIRABLE && (
                  <div className="p-3 bg-red-50/80 dark:bg-red-950/20 space-y-2">
                    <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold text-sm">
                      <XCircle className="h-4 w-4" /> Device Unrepairable
                    </div>
                    <p className="text-xs text-red-600/80 dark:text-red-500/80">Device cannot be repaired. Ready to be returned to customer.</p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button onClick={handleReturnUnrepairable} disabled={isPending} className="bg-red-600 hover:bg-red-700 text-white shadow-sm"><PackageCheck className="h-4 w-4 mr-2"/> Return to Customer</Button>
                    </div>
                  </div>
                )}

                {acceptance.currentStatus === REPAIR_STATUSES.CANCELLED && (
                  <div className="p-3 bg-red-50/80 dark:bg-red-950/20 space-y-2">
                    <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold text-sm">
                      <XCircle className="h-4 w-4" /> Repair Cancelled
                    </div>
                    <p className="text-xs text-red-600/80 dark:text-red-500/80">Device is unrepairable or customer declined. Ready to return.</p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button onClick={handleReturnCancelled} disabled={isPending} className="bg-red-600 hover:bg-red-700 text-white shadow-sm"><PackageCheck className="h-4 w-4 mr-2"/> Return to Customer</Button>
                    </div>
                  </div>
                )}

                {acceptance.currentStatus === REPAIR_STATUSES.READY && (
                  <div className="p-3 bg-emerald-50/80 dark:bg-emerald-950/20 space-y-2">
                    <div>
                      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-500 font-bold text-sm mb-1">
                        <CreditCard className="h-4 w-4" /> Ready for Delivery
                      </div>
                      <p className="text-xs text-emerald-600/80 dark:text-emerald-500/80">Device is fixed. Collect the pending balance to complete the ticket.</p>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {(acceptance.balanceDue || 0) > 0 ? (
                        <Button onClick={handleCheckout} disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                          Collect <CurrencyText amount={acceptance.balanceDue || 0} /> & Deliver
                        </Button>
                      ) : (
                        <Button onClick={handleCheckout} disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"><PackageCheck className="h-4 w-4 mr-2"/> Deliver Device</Button>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* ADD NOTE SECTION - Status-Wise Positioned */}
          {!isDelivered && !isTradedIn && (
            <div className="relative">
              <div className="absolute -left-[31px] top-2 h-3 w-3 rounded-full bg-background border-2 border-info ring-4 ring-background" />
              <div className="mb-6">
                <Button variant="outline" size="sm" onClick={() => setIsAdding(!isAdding)} className="h-8 text-[11px] font-bold gap-1.5 mb-3"><MessageSquarePlus className="h-3.5 w-3.5" /> Add Note</Button>
                {isAdding && (
                  <div className="bg-muted/20 p-3 rounded-lg border border-border">
                    <textarea ref={noteInputRef} className="w-full text-sm p-2 rounded-md border border-input bg-background mb-2" rows={2} placeholder="Type technician note here..." value={note} onChange={(e) => setNote(e.target.value)} />
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)}>Cancel</Button>
                      <Button size="sm" onClick={handleAddNote} disabled={isPending}><Send className="h-3 w-3 mr-2" /> Save Note</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* HISTORICAL LOGS */}
          {acceptance.timelineLogs?.map((log, index) => {
            const IconComponent = log.icon ? iconMap[log.icon] : null;
            const isFirstLog = index === 0;
            const isCompleted = isDelivered && isFirstLog;
            
            // Determine if this event should have a print button
            const hasPrintButton = 
              log.action === "TICKET_CREATED" || // PENDING status
              log.action === "STATUS_CHANGED" || // Any status change (Diagnosing, In Progress, Ready)
              log.action === "PART_ADDED" || // Parts added during repair
              log.action === "DELIVERY_COMPLETED"; // Final invoice
            
            // Determine invoice type based on action/description
            const getInvoiceTypeForLog = (): InvoiceType => {
              if (log.action === "TICKET_CREATED") return "PENDING";
              if (log.action === "PART_ADDED") return "IN_PROGRESS";
              if (log.description?.includes("Ready")) return "READY";
              if (log.action === "DELIVERY_COMPLETED") return "DELIVERY";
              return "PENDING";
            };
            
            return (
              <div key={log.id} className="relative group">
                <div 
                  className={`absolute -left-[31px] top-1 h-3 w-3 rounded-full ring-4 transition-all flex items-center justify-center text-white text-[8px] font-bold ${isCompleted ? 'ring-green-200 bg-green-500' : 'ring-background'}`}
                  style={!isCompleted ? { backgroundColor: log.color } : undefined}
                >
                  {isCompleted && '✓'}
                </div>
                <p className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground mb-1">
                  {new Date(log.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </p>
                <div className={`bg-muted/20 p-3.5 rounded-xl border text-sm shadow-sm transition-all ${isCompleted ? 'border-green-300 bg-green-50/30' : 'border-border/40'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <span className="font-black text-[10px] tracking-widest uppercase px-2 py-0.5 rounded mr-2 align-middle inline-flex items-center gap-1.5" style={!isCompleted ? { backgroundColor: `${log.color}15`, color: log.color } : { backgroundColor: '#10b98120', color: '#059669' }}>
                        {isCompleted ? <CheckCircle className="h-3 w-3" /> : (IconComponent && <IconComponent className="h-3 w-3" />)}
                        {isCompleted ? 'Completed' : log.action}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`font-medium ${isCompleted ? 'text-green-700' : 'text-foreground'}`}>{log.description}</span>
                        {log.metadata && 'userName' in log.metadata && (
                          <span className="text-[10px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">by {String(log.metadata.userName)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasPrintButton && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs gap-1"
                          onClick={() => openInvoicePrint(getInvoiceTypeForLog(), log.metadata)}
                        >
                          <Printer className="h-3 w-3" />
                          Print
                        </Button>
                      )}
                      {log.action === "NOTE_ADDED" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDeleteNote(log.id)}
                          disabled={isPending}
                          title="Delete note"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {(!acceptance.timelineLogs || acceptance.timelineLogs.length === 0) && (
            <p className="text-sm text-muted-foreground text-center italic py-4">No activities recorded yet.</p>
          )}
        </div>
      </CardContent>
    </Card>

    <Dialog open={showConfirmDialog} onOpenChange={(open) => {
      if (!open && isCheckoutMode) {
        setIsCheckoutMode(false)
      }
      setShowConfirmDialog(open)
    }}>
      <DialogContent className="max-w-md">
        {isCheckoutMode ? (
          <>
            <DialogHeader>
              <DialogTitle>💰 Checkout & Delivery</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              {/* Total Amount Due */}
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-600 font-medium">Due Amount ({currency})</p>
                <p className="text-2xl font-black text-blue-700">
                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(dueAmount)}
                </p>
              </div>

              {/* Payment Method */}
              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground mb-2 block">Payment Method</label>
                <select 
                  value={paymentMethod} 
                  onChange={(e) => setPaymentMethod(e.target.value as "cash" | "card" | "check" | "bank_transfer")}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="cash">💵 Cash</option>
                  <option value="card">💳 Card</option>
                  <option value="check">📋 Check</option>
                  <option value="bank_transfer">🏦 Bank Transfer</option>
                </select>
              </div>

              {/* Payment Amount */}
              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground mb-2 block">Amount Collected ({currency})</label>
                <input 
                  type="number" 
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="0"
                  step="0.01"
                />
              </div>

              {/* Discount */}
              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground mb-2 block">Discount ({currency})</label>
                <input 
                  type="number" 
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="0"
                  step="0.01"
                />
              </div>

              {/* Calculation Summary */}
              <div className="space-y-2 bg-muted p-3 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total (after discount):</span>
                  <span className="font-semibold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(adjustedTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount Paid:</span>
                  <span className="font-semibold">{new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(paidAmount)}</span>
                </div>
                {changeAmount > 0 && (
                  <div className="flex justify-between text-sm border-t pt-2 border-border">
                    <span className="text-emerald-600 font-medium">Change to Give:</span>
                    <span className="font-bold text-emerald-600">{new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(changeAmount)}</span>
                  </div>
                )}
                {remainingDue > 0 && (
                  <div className="flex justify-between text-sm border-t pt-2 border-border">
                    <span className="text-amber-600 font-medium">Still Due:</span>
                    <span className="font-bold text-amber-600">{new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(remainingDue)}</span>
                  </div>
                )}
              </div>

              {/* Additional Notes */}
              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground mb-2 block">Notes</label>
                <textarea 
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="Add notes about payment..."
                  rows={2}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowConfirmDialog(false)
                    setIsCheckoutMode(false)
                    setPaymentAmount("")
                    setDiscountAmount("0")
                    setPaymentNotes("")
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCheckoutSubmit}
                  disabled={isPending || !paymentAmount}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isPending ? "Processing..." : "Complete Delivery"}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
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
          </>
        )}
      </DialogContent>
    </Dialog>

    {/* Invoice Print Dialog */}
    <PrintableDialog
      isOpen={invoiceDialogOpen}
      onOpenChange={setInvoiceDialogOpen}
      title={`Repair ${selectedInvoiceType === "DELIVERY" ? "Receipt" : selectedInvoiceType === "PENDING" ? "Estimate" : "Invoice"}`}
      icon={<Receipt className="h-4 w-4" />}
      printableElementId="printable-invoice"
      className="max-w-4xl p-0 overflow-hidden h-[95vh]"
    >
      <AcceptanceInvoiceView
        acceptance={{
          ...acceptance,
          currentStatus: getStatusForInvoiceType(selectedInvoiceType),
          ...(invoiceSnapshot && {
            totalCost: invoiceSnapshot.totalCost ?? acceptance.totalCost,
            advancePayment: invoiceSnapshot.advancePayment ?? acceptance.advancePayment,
            balanceDue: invoiceSnapshot.balanceDue ?? acceptance.balanceDue,
          })
        }}
        invoiceType={selectedInvoiceType}
      />
    </PrintableDialog>
    </>
  )
}