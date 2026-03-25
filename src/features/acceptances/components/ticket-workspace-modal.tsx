"use client"

import { useState } from "react"
import { Acceptance } from "../acceptance.schema"
import { TicketHeader } from "./workspace/ticket-header"
import { TicketOverview } from "./workspace/ticket-overview"
import { TicketFinance } from "./workspace/ticket-finance"
import { TicketTimeline } from "./workspace/ticket-timeline"
import { TicketAdvancedDetails } from "./workspace/ticket-advanced-details"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Settings2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface TicketWorkspaceModalProps {
  initialData?: Acceptance
  onSuccess?: (data: Acceptance) => void
}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
export function TicketWorkspaceModal({ initialData, onSuccess }: TicketWorkspaceModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "advanced">("overview")
  const [acceptance, setAcceptance] = useState<Acceptance | null>(initialData || null)

  if (!acceptance) return null

  const handleAcceptanceUpdate = (updatedAcceptance: Acceptance) => {
    setAcceptance(updatedAcceptance)
    // Don't call onSuccess here - that would close the modal immediately
    // Only update the local state so the modal stays open
  }

  return (
    <div className="flex flex-col max-h-[95vh]">
      <TicketHeader acceptance={acceptance} />

      <div className="flex items-center gap-2 px-6 pt-4 pb-2 border-b border-border/50 bg-background/50 backdrop-blur-md flex-shrink-0">
        <Button
          variant={activeTab === "overview" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("overview")}
          className={cn("h-8 text-xs font-bold rounded-full px-4 transition-all", activeTab === "overview" && "bg-primary/10 text-primary hover:bg-primary/20")}
        >
          <LayoutDashboard className="h-3.5 w-3.5 mr-2" /> General Overview
        </Button>
        <Button
          variant={activeTab === "advanced" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("advanced")}
          className={cn("h-8 text-xs font-bold rounded-full px-4 transition-all", activeTab === "advanced" && "bg-primary/10 text-primary hover:bg-primary/20")}
        >
          <Settings2 className="h-3.5 w-3.5 mr-2" /> Advanced Details & Photos
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-muted/20">
        {activeTab === "overview" ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-6">
              <TicketOverview acceptance={acceptance} />
              <TicketFinance acceptance={acceptance} onUpdate={handleAcceptanceUpdate} />
            </div>
            <div className="space-y-6">
              <TicketTimeline acceptance={acceptance} onUpdate={handleAcceptanceUpdate} />
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
            <TicketAdvancedDetails acceptance={acceptance} />
          </div>
        )}
      </div>
    </div>
  )
}
