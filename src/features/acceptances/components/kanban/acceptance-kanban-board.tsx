"use client"

import { useAcceptances, useUpdateAcceptance } from "../../acceptance.api"
import { AcceptanceKanbanCard } from "./acceptance-kanban-card"
import { useAcceptanceModal } from "../../acceptance-modal-context"
import { Loader2 } from "lucide-react"
import { Acceptance } from "../../acceptance.schema"
import { toast } from "sonner"
import { KANBAN_COLUMNS } from "../../acceptance.constants"
import { 
  createOperationalLog, 
  createTimelineLog, 
  getIconForAction, 
  getColorForStatus,
  prependLog 
} from "../../acceptance-logging"

export function AcceptanceKanbanBoard() {
  const { data, isLoading } = useAcceptances({ page: 1, pageSize: 100 }) // Load initial batch for the board
  const { mutate: updateStatus } = useUpdateAcceptance()
  const { openModal } = useAcceptanceModal()

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  const acceptances = data?.data || []
  const columns = KANBAN_COLUMNS;

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("ticketId", id)
  }

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    const ticketId = e.dataTransfer.getData("ticketId")
    const ticket = acceptances.find(a => a.id === ticketId)
    if (ticket && ticket.currentStatus !== newStatus) {
      const operationalLog = createOperationalLog(
        "STATUS_CHANGED",
        `Status changed from ${ticket.currentStatus} to ${newStatus}`,
        "current-user-id",
        { fromStatus: ticket.currentStatus, toStatus: newStatus }
      );
      const timelineLog = createTimelineLog(
        "STATUS_CHANGED",
        `Status changed to ${newStatus}`,
        getIconForAction("STATUS_CHANGED"),
        getColorForStatus(newStatus),
        "current-user-id"
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any = { 
        currentStatus: newStatus,
        operationalLogs: prependLog(ticket.operationalLogs || [], operationalLog),
        timelineLogs: prependLog(ticket.timelineLogs || [], timelineLog)
      };
      updateStatus({ 
        id: ticketId, 
        data
      }, {
         onSuccess: () => toast.success(`Ticket moved to ${newStatus}`),
         onError: () => toast.error("Failed to move ticket")
       })
    }
  }

  return (
    <div className="flex h-full overflow-x-auto gap-4 pb-4">
      {columns.map(col => {
        const colItems = acceptances.filter(a => a.currentStatus === col)
        return (
          <div key={col} className="flex-shrink-0 w-80 bg-muted/40 rounded-xl border flex flex-col h-full max-h-[calc(100vh-12rem)]" onDrop={(e) => handleDrop(e, col)} onDragOver={(e) => e.preventDefault()}>
            <div className="p-3 border-b border-border/50 bg-muted/50 rounded-t-xl flex justify-between items-center">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">{col}</h3>
              <span className="bg-background text-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">{colItems.length}</span>
            </div>
            <div className="flex-1 p-3 overflow-y-auto">
              {colItems.map(item => (
                <div key={item.id} draggable onDragStart={(e) => handleDragStart(e, item.id)}>
                  <AcceptanceKanbanCard acceptance={item} onClick={() => openModal({ initialData: item as Acceptance, isViewMode: true })} />
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}