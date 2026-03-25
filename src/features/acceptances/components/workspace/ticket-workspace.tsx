"use client"

import { useState } from "react"
import { Acceptance } from "../../acceptance.schema"
import { TicketHeader } from "./ticket-header"
import { TicketOverview } from "./ticket-overview"
import { TicketFinance } from "./ticket-finance"
import { TicketTimeline } from "./ticket-timeline"
import { TicketAdvancedDetails } from "./ticket-advanced-details"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Settings2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface TicketWorkspaceProps {
  acceptance: Acceptance
  onClose: () => void
}

export function TicketWorkspace({ acceptance, onClose }: TicketWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "advanced">("overview")

  return (
    <div className="flex flex-col h-full bg-muted/20">
      <TicketHeader acceptance={acceptance} onClose={onClose} />

      <div className="flex items-center gap-2 px-6 pt-4 pb-2 border-b border-border/50 bg-gradient-to-r from-background to-transparent sticky top-[73px] z-10">
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

      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === "overview" ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-6">
              <TicketOverview acceptance={acceptance} />
              <TicketFinance acceptance={acceptance} />
            </div>
            <div className="space-y-6">
              <TicketTimeline acceptance={acceptance} />
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