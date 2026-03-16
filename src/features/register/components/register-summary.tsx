"use client"

import { Banknote, CreditCard, Landmark, Wallet, ArrowUpCircle, ArrowDownCircle, Info, CheckCircle } from "lucide-react"
import { RegisterLog } from "../register.schema"
import { cn } from "@/lib/utils"

interface RegisterSummaryProps {
  register: RegisterLog
}

export function RegisterSummary({ register }: RegisterSummaryProps) {
  const totalSales = register.totalCashSales + register.totalCardSales + register.totalDigitalSales
  const expectedInDrawer = register.openingBalance + register.totalCashSales
  const difference = register.actualBalance ? register.actualBalance - expectedInDrawer : 0

  const summaryCards = [
    {
      label: "Opening Cash",
      value: register.openingBalance,
      icon: <Wallet className="h-4 w-4" />,
      color: "text-muted-foreground",
      bg: "bg-muted/50"
    },
    {
      label: "Cash Sales",
      value: register.totalCashSales,
      icon: <Banknote className="h-4 w-4" />,
      color: "text-emerald-600 dark:text-emerald-500",
      bg: "bg-emerald-500/10"
    },
    {
      label: "Card/Digital",
      value: register.totalCardSales + register.totalDigitalSales,
      icon: <CreditCard className="h-4 w-4" />,
      color: "text-primary",
      bg: "bg-primary/10"
    },
  ]

  return (
    <div className="space-y-6">
      {/* 1. Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {summaryCards.map((card, idx) => (
          <div key={idx} className={cn("p-4 rounded-2xl border border-dashed flex flex-col gap-1", card.bg, "border-border/50")}>
            <div className={cn("flex items-center gap-2 font-black text-[10px] uppercase tracking-widest", card.color)}>
              {card.icon}
              {card.label}
            </div>
            <p className="text-2xl font-black text-foreground">৳{card.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* 2. Reconciliation Summary */}
      <div className="bg-foreground rounded-3xl p-6 text-background shadow-xl relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Revenue Generated</span>
            <h2 className="text-4xl font-black mt-1">৳{totalSales.toLocaleString()}</h2>
            <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
              <Info className="h-3 w-3" /> Includes cash, card and all digital payments.
            </p>
          </div>

          <div className="flex flex-col justify-end md:items-end">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Expected Cash in Drawer</span>
            <h2 className="text-3xl font-black mt-1">৳{expectedInDrawer.toLocaleString()}</h2>
          </div>
        </div>
        
        {/* Background Decorative Icon */}
        <Landmark className="absolute -right-4 -bottom-4 h-32 w-32 text-background/5 rotate-12" />
      </div>

      {/* 3. Shortage/Over Alert (Only if closed) */}
      {register.status === "CLOSED" && (
        <div className={cn(
          "flex items-center justify-between p-4 rounded-2xl border-2",
          difference === 0 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-500" : 
          difference > 0 ? "bg-primary/10 border-primary/20 text-primary" : "bg-destructive/10 border-destructive/20 text-destructive"
        )}>
          <div className="flex items-center gap-3">
            {difference < 0 ? <ArrowDownCircle className="h-6 w-6 text-destructive" /> : <CheckCircleIcon difference={difference} />}
            <div>
              <p className="text-xs font-black uppercase tracking-widest">Reconciliation Result</p>
              <p className="text-sm font-medium">
                {difference === 0 ? "Perfectly Balanced" : 
                 difference > 0 ? `Surplus of ৳${difference.toLocaleString()}` : `Shortage of ৳${Math.abs(difference).toLocaleString()}`}
              </p>
            </div>
          </div>
          <div className="text-right font-black text-lg">
            {difference > 0 && "+"}৳{difference.toLocaleString()}
          </div>
        </div>
      )}
    </div>
  )
}

function CheckCircleIcon({ difference }: { difference: number }) {
  return <ArrowUpCircle className={cn("h-6 w-6", difference === 0 ? "text-emerald-500" : "text-primary")} />
}