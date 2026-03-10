"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Plus, Smartphone, Receipt, Wrench, 
  Clock, CheckCircle2, AlertTriangle, Wallet,
  Search, ArrowRight
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

export function FrontdeskView() {
  const { data: stats, isLoading: statsLoading } = useFrontdeskStats()
  const { data: urgentJobs, isLoading: urgentLoading } = useUrgentJobs()
  const { data: recentJobs, isLoading: recentLoading } = useRecentActivities()
  const router = useRouter()
  const { openModal: openAcceptanceModal } = useAcceptanceModal()
  const { openModal: openQuotationModal } = useQuotationModal()
  const { openModal: openExpenseModal } = useExpenseModal()

  if (statsLoading || urgentLoading || recentLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-6 bg-slate-50/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-full md:w-96" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-12">
          <div className="md:col-span-8">
            <Skeleton className="h-[400px] rounded-2xl" />
          </div>
          <div className="md:col-span-4 space-y-4">
            <Skeleton className="h-[200px] rounded-2xl" />
            <Skeleton className="h-[200px] rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6 bg-slate-50/30">
      {/* Header with Quick Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-800 uppercase">Frontdesk Counter</h1>
          <p className="text-xs text-slate-500">Manage today&apos;s operations and customer flow</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Search Customer, IMEI or Job ID..." className="pl-10 h-10 bg-white border-slate-200 shadow-sm rounded-xl" />
        </div>
      </div>

      {/* Quick Action Grid - বড় বাটন যা দ্রুত কাজ শুরু করতে সাহায্য করবে */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Button onClick={() => openAcceptanceModal()} className="h-16 bg-slate-600 hover:bg-slate-700 rounded-2xl flex flex-col gap-1 shadow-lg shadow-slate-100">
          <Wrench className="h-5 w-5" /> <span className="text-[10px] font-black uppercase">New Repair</span>
        </Button>
        <Button onClick={() => router.push(SALES_POS_HREF)} variant="outline" className="h-16 border-slate-200 bg-white rounded-2xl flex flex-col gap-1 shadow-sm">
          <Smartphone className="h-5 w-5 text-emerald-600" /> <span className="text-[10px] font-black uppercase">Sell Product</span>
        </Button>
        <Button onClick={() => openQuotationModal()} variant="outline" className="h-16 border-slate-200 bg-white rounded-2xl flex flex-col gap-1 shadow-sm">
          <Receipt className="h-5 w-5 text-amber-600" /> <span className="text-[10px] font-black uppercase">Create Quote</span>
        </Button>
        <Button onClick={() => openExpenseModal()} variant="outline" className="h-16 border-slate-200 bg-white rounded-2xl flex flex-col gap-1 shadow-sm">
          <Wallet className="h-5 w-5 text-purple-600" /> <span className="text-[10px] font-black uppercase">Add Expense</span>
        </Button>
      </div>

      {/* Today's Stats - Compact Cards */}
      <div className="grid gap-3 md:grid-cols-4">
        <StatCard 
          title="Today's Intake" 
          value={stats?.todayAcceptances} 
          change={stats?.acceptancesChange ? `${stats.acceptancesChange > 0 ? '+' : ''}${stats.acceptancesChange} from yesterday` : undefined} 
          icon={<Plus className="h-4 w-4" />} 
        />
        <StatCard title="Under Repair" value={stats?.pendingJobs} change="Critical Action Needed" icon={<Clock className="h-4 w-4" />} color="text-amber-600" />
        <StatCard title="Ready to Deliver" value={stats?.readyToDeliver} change="Awaiting Customer" icon={<CheckCircle2 className="h-4 w-4" />} color="text-emerald-600" />
        <StatCard 
          title="Today's Khata (Net)" 
          value={stats?.totalRevenue} 
          change={stats?.revenueChange ? `${stats.revenueChange > 0 ? '+' : ''}${stats.revenueChange}% from yesterday` : undefined}
          icon={<Wallet className="h-4 w-4" />} 
          isCurrency 
        />
      </div>

      <div className="grid gap-4 md:grid-cols-12">
        {/* Left: Active Repair Board */}
        <Card className="md:col-span-8 rounded-2xl shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <CardTitle className="text-xs font-black uppercase text-slate-500">In-Store Repairs & Status</CardTitle>
            <Button variant="ghost" size="sm" className="text-[10px] font-bold">VIEW ALL <ArrowRight className="ml-1 h-3 w-3" /></Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-50">
              {recentJobs?.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                      <Smartphone className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-slate-800 uppercase">{job.customer}</p>
                      <p className="text-[10px] text-slate-500">{job.device} • <span className="font-bold text-blue-600">{job.issue}</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Due</p>
                      <p className="text-[10px] font-black">{job.time}</p>
                    </div>
                    <Badge variant="secondary" className="text-[9px] font-black uppercase px-2 py-0.5 rounded-lg">
                      {job.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right: Urgent Alerts & Low Stock */}
        <div className="md:col-span-4 space-y-4">
          <Card className="rounded-2xl border-orange-100 bg-orange-50/30 shadow-sm">
            <CardHeader className="py-4">
              <CardTitle className="text-xs font-black uppercase text-orange-600 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Priority Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {urgentJobs?.map(job => (
                <div key={job.id} className="bg-white p-3 rounded-xl border border-orange-100 flex justify-between items-center shadow-sm">
                   <div className="min-w-0">
                     <p className="text-[10px] font-black truncate uppercase">{job.customer}</p>
                     <p className="text-[9px] text-orange-700 font-bold">{job.issue}</p>
                   </div>
                   <Badge className="bg-orange-600 text-[8px] h-4">URGENT</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 shadow-sm">
             <CardHeader className="py-4">
                <CardTitle className="text-xs font-black uppercase text-slate-500">Shortage Parts</CardTitle>
             </CardHeader>
             <CardContent className="space-y-3">
                {/* Mock Low Stock */}
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold">iPhone 13 Screen (GX)</span>
                  <Badge variant="destructive" className="h-4 text-[8px]">1 LEFT</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold">S22 Ultra Charging Port</span>
                  <Badge variant="destructive" className="h-4 text-[8px]">OUT</Badge>
                </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function StatCard({ title, value, change, icon, color = "text-slate-900", isCurrency = false }: any) {
  return (
    <Card className="rounded-2xl shadow-sm border-slate-100">
      <CardContent className="p-4 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">{title}</span>
          <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400">{icon}</div>
        </div>
        <div className={`text-xl font-black ${color}`}>
          {isCurrency ? <CurrencyText amount={value} /> : value}
        </div>
        {change && <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{change}</p>}
      </CardContent>
    </Card>
  )
}