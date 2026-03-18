"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Smartphone, Receipt, Wrench,
  Clock, CheckCircle2, AlertTriangle, Wallet,
  Search, ArrowRight, Zap, Target
} from "lucide-react"
import { useFrontdeskStats, useUrgentJobs, useRecentActivities } from "../dashboard.api"
import { CurrencyText } from "@/components/shared/data-table-cells"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useAcceptanceModal } from "@/features/acceptances/acceptance-modal-context"
import { useQuotationModal } from "@/features/quotations/quotation-modal-context"
import { useExpenseModal } from "@/features/expenses/expense-modal-context"
import { SALES_POS_HREF } from "@/config/paths"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export function FrontdeskView() {
  const { data: stats, isLoading: statsLoading } = useFrontdeskStats()
  const { data: urgentJobs, isLoading: urgentLoading } = useUrgentJobs()
  const { data: recentJobs, isLoading: recentLoading } = useRecentActivities()
  const router = useRouter()
  const { openModal: openAcceptanceModal } = useAcceptanceModal()
  const { openModal: openQuotationModal } = useQuotationModal()
  const { openModal: openExpenseModal } = useExpenseModal()

  // সাবলীল লোডিং এনিমেশন (Pulse + Fade in)
  if (statsLoading || urgentLoading || recentLoading) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-9 w-64 bg-muted/50" />
            <Skeleton className="h-4 w-80 bg-muted/50" />
          </div>
          <Skeleton className="h-12 w-full md:w-96 rounded-xl bg-muted/50" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 rounded-3xl bg-muted/50" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-3xl bg-muted/50" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-12">
          <Skeleton className="md:col-span-8 h-[450px] rounded-3xl bg-muted/50" />
          <div className="md:col-span-4 space-y-6">
            <Skeleton className="h-[220px] rounded-3xl bg-muted/50" />
            <Skeleton className="h-[200px] rounded-3xl bg-muted/50" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 animate-fade-in">
      {/* Header with Quick Search - Gradient Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-2 border-b border-border/50">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tighter uppercase flex items-center gap-2">
            <Target className="h-7 w-7 text-primary animate-pulse" />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'var(--primary-gradient)' }}
            >
              Frontdesk Counter
            </span>
          </h1>
          <p className="text-sm font-medium text-muted-foreground opacity-80 mt-1">Directly manage today&apos;s operations and customer flow</p>
        </div>
        <div className="relative w-full md:w-[400px] group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search Customer name, IMEI or Repair ID..."
            className="pl-12 h-12 bg-card border-border/80 focus-visible:border-primary focus-visible:ring-primary/20 shadow-inner rounded-full text-base"
          />
        </div>
      </div>

      {/* Quick Action Grid - বড় গর্জিয়াস বাটন */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Wrench, label: "New Repair Intake", action: () => openAcceptanceModal(), type: 'gradient', color: '' },
          { icon: Smartphone, label: "Sell Accessories", action: () => router.push(SALES_POS_HREF), type: 'outline', color: 'text-cyan-500' },
          { icon: Receipt, label: "Create Quotation", action: () => openQuotationModal(), type: 'outline', color: 'text-pink-500' },
          { icon: Wallet, label: "Quick Expense", action: () => openExpenseModal(), type: 'outline', color: 'text-amber-500' },
        ].map((btn, i) => {
          const isGradient = btn.type === 'gradient';
          return (
            <Button
              key={i}
              onClick={btn.action}
              className={cn(
                "group h-20 rounded-3xl flex flex-col gap-2 relative overflow-hidden border transition-all",
                isGradient
                  ? "border-transparent hover:-translate-y-1"
                  : "bg-card border-border/80 hover:border-primary/50 text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:-translate-y-1 hover:shadow-lg"
              )}
              style={isGradient ? {
                backgroundImage: 'var(--primary-gradient)',
                color: 'var(--primary-foreground)',
                backgroundSize: '200% auto',
                animation: 'gradient-slide 5s ease infinite'
              } : {}}
              onMouseEnter={(e) => {
                if (isGradient) e.currentTarget.style.boxShadow = 'var(--button-glow)';
              }}
              onMouseLeave={(e) => {
                if (isGradient) e.currentTarget.style.boxShadow = 'none';
              }}
            >
                <btn.icon className={cn("h-6 w-6 transition-transform group-hover:scale-110", isGradient ? "text-current" : btn.color)} />
                <span className={cn("text-[11px] font-bold uppercase tracking-wider", isGradient ? "text-current" : "text-muted-foreground")}>{btn.label}</span>
              {isGradient && <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />}
            </Button>
          )
        })}
      </div>

      {/* Today's Stats - Gorgeous Compact Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <StatCard
          title="Today's Intake"
          value={stats?.todayAcceptances}
          change={stats?.acceptancesChange ? `${stats.acceptancesChange > 0 ? '+' : ''}${stats.acceptancesChange} device(s)` : undefined}
          icon={<Zap className="h-5 w-5" />}
          animationDelay="delay-100"
        />
        <StatCard title="Under Repair" value={stats?.pendingJobs} change="Requires Tech Action" icon={<Clock className="h-5 w-5" />} color="text-amber-500" animationDelay="delay-200" />
        <StatCard title="Ready to Deliver" value={stats?.readyToDeliver} change="Awaiting Customer" icon={<CheckCircle2 className="h-5 w-5" />} color="text-cyan-500" animationDelay="delay-300" />
        <StatCard
          title="Today's Collection"
          value={stats?.totalRevenue}
          change={stats?.revenueChange ? `${stats.revenueChange > 0 ? '+' : ''}${stats.revenueChange}% vs yesterday` : undefined}
          icon={<Wallet className="h-5 w-5" />}
          isCurrency
          color="text-primary font-extrabold"
          animationDelay="delay-400"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Left: Active Repair Board - Glassmorphism look */}
        <Card className="md:col-span-8 rounded-3xl shadow-lg border-border/80 bg-card/60 backdrop-blur-sm overflow-hidden animate-slide-in-up">
          <CardHeader className="flex flex-row items-center justify-between py-5 px-6 border-b border-border/50 bg-muted/20">
            <CardTitle className="text-sm font-extrabold uppercase text-muted-foreground tracking-widest flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" /> Current Repairs Timeline
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-[11px] font-bold text-primary hover:text-primary/80 hover:bg-primary/5 rounded-full px-4">
              VIEW ALL TRACKER <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              {recentJobs?.map((job, i) => (
                <div key={job.id} className={cn(
                  "flex items-center justify-between p-5 transition-all duration-300 hover:bg-muted/50 group",
                  `animate-fade-in delay-[${i * 50}ms]`
                )}>
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-muted/70 flex items-center justify-center text-muted-foreground border border-border/50 group-hover:border-primary/20 group-hover:bg-primary/5 transition-colors">
                      <Smartphone className="h-5 w-5 group-hover:text-primary transition-colors" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-foreground uppercase tracking-tight truncate">{job.customer}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate font-medium">
                        {job.device} • <span className="font-bold text-primary opacity-90">{job.issue}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-5 ml-4 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Due By</p>
                      <p className="text-xs font-black text-foreground mt-0.5">{job.time}</p>
                    </div>
                    <Badge variant="secondary" className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-muted text-muted-foreground border border-border/50 group-hover:border-primary/20 group-hover:text-primary transition-colors">
                      {job.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right: Urgent Alerts & Stock - গ্লো এবং বর্ডার এনিমেশন */}
        <div className="md:col-span-4 space-y-6">
          <Card className="rounded-3xl border-pink-500/20 bg-pink-500/5 shadow-neon-sm animate-slide-in-up delay-150">
            <CardHeader className="py-5 px-6 border-pink-500/10 border-b">
              <CardTitle className="text-sm font-extrabold uppercase text-pink-600 dark:text-pink-400 flex items-center gap-2.5 tracking-wider animate-pulse">
                <AlertTriangle className="h-5 w-5 text-pink-500" /> High Priority Critical Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              {urgentJobs?.map(job => (
                <div key={job.id} className="bg-card p-4 rounded-2xl border border-pink-500/20 flex justify-between items-center shadow-md hover:border-pink-500/40 transition-colors group">
                  <div className="min-w-0">
                    <p className="text-xs font-black truncate uppercase tracking-tight text-foreground group-hover:text-pink-500 transition-colors">{job.customer}</p>
                    <p className="text-[10px] text-pink-700 dark:text-pink-400 font-bold mt-0.5">{job.issue}</p>
                  </div>
                  <Badge className="bg-pink-600 hover:bg-pink-700 dark:bg-pink-500 text-white dark:text-pink-950 text-[9px] h-5 font-black px-2.5 rounded-full shadow-lg shadow-pink-500/30">URGENT</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-border shadow-sm animate-slide-in-up delay-300">
            <CardHeader className="py-5 px-6 border-b border-border/50">
              <CardTitle className="text-sm font-extrabold uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" /> Shortage Parts Alert
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="flex justify-between items-center p-3 bg-muted/40 rounded-xl">
                <span className="text-xs font-bold text-foreground">iPhone 13 Screen (GX OEM)</span>
                <Badge variant="destructive" className="h-5 text-[9px] font-black px-2.5 rounded-full animate-pulse">1 LEFT</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/40 rounded-xl">
                <span className="text-xs font-bold text-foreground">S22 Ultra Charging Port</span>
                <Badge variant="destructive" className="h-5 text-[9px] font-black px-2.5 rounded-full">OUT OF STOCK</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function StatCard({ title, value, change, icon, color = "text-foreground", isCurrency = false, animationDelay }: any) {
  return (
    <Card className={cn("rounded-3xl shadow-md border-border hover:border-primary/30 transition-all hover:shadow-primary/5 hover:-translate-y-1 animate-slide-in-up", animationDelay)}>
      <CardContent className="p-5 flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase text-muted-foreground tracking-widest opacity-80">{title}</span>
          <div className="p-2 bg-primary/10 rounded-xl text-primary border border-primary/20 shadow-inner">{icon}</div>
        </div>
        <div className={`text-3xl font-extrabold tracking-tighter ${color}`}>
          {isCurrency ? <CurrencyText amount={value} /> : value}
        </div>
        {change && (
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight mt-1 bg-muted px-2 py-0.5 rounded w-fit">
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  )
}