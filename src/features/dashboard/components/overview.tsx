"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useDashboardStats, useRevenueChart, useStatusDistribution } from "../dashboard.api"
import { CurrencyText } from "@/components/shared/data-table-cells"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from "recharts"
import { TrendingUp, CreditCard, ShoppingBag, Package, Badge } from "lucide-react"

export function Overview() {
  const { data: stats } = useDashboardStats()
  const { data: revenueData } = useRevenueChart()
  const { data: statusData } = useStatusDistribution()

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black tracking-tight text-slate-800">Business Overview</h2>
        <Badge variant="outline" className="text-[10px] font-black uppercase px-3 py-1 border-slate-200">Past 30 Days</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Revenue" value={stats?.totalRevenue} change={`+${stats?.revenueChange}%`} icon={<TrendingUp className="h-4 w-4" />} color="text-emerald-600" />
        <MetricCard title="Net Profit" value={stats?.netProfit} change={`+${stats?.profitChange}%`} icon={<CreditCard className="h-4 w-4" />} color="text-blue-600" />
        <MetricCard title="Sales Count" value={stats?.totalOrders} change={`+${stats?.ordersChange}%`} icon={<ShoppingBag className="h-4 w-4" />} />
        <MetricCard title="Total Stock Value" value={stats?.totalStockValue} change="Inventory Asset" icon={<Package className="h-4 w-4" />} />
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="col-span-4 rounded-3xl border-slate-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase text-slate-500">Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <XAxis dataKey="name" stroke="#cbd5e1" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#cbd5e1" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `€${value}`} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                <Bar dataKey="total" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3 rounded-3xl border-slate-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase text-slate-500">Repair Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={8}>
                  {statusData?.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function MetricCard({ title, value, change, icon, color = "text-slate-900" }: any) {
  return (
    <Card className="rounded-3xl border-slate-100 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-[10px] font-black uppercase text-slate-400">{title}</CardTitle>
        <div className="text-slate-300">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-black ${color}`}>
          {typeof value === 'number' ? `€${value.toLocaleString()}` : value}
        </div>
        <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">{change}</p>
      </CardContent>
    </Card>
  )
}