"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarDays, Clock, Users, Wrench, DollarSign, AlertCircle } from "lucide-react"

export default function FrontdeskPage() {
  // Dummy data for demonstration
  const stats = {
    todayAcceptances: 12,
    pendingJobs: 8,
    completedToday: 5,
    totalRevenue: 2450,
  }

  const recentAcceptances = [
    {
      id: "41604-2025",
      customer: "John Doe",
      device: "iPhone 12",
      issue: "Screen replacement",
      status: "In Progress",
      time: "2 hours ago",
    },
    {
      id: "41605-2025",
      customer: "Jane Smith",
      device: "Samsung Galaxy S21",
      issue: "Battery replacement",
      status: "Pending",
      time: "1 hour ago",
    },
    {
      id: "41606-2025",
      customer: "Bob Johnson",
      device: "iPad Pro",
      issue: "Charging port repair",
      status: "Completed",
      time: "30 minutes ago",
    },
  ]

  const urgentJobs = [
    {
      id: "41601-2025",
      customer: "Alice Brown",
      device: "MacBook Air",
      issue: "Data recovery needed",
      priority: "High",
      dueDate: "Today",
    },
    {
      id: "41602-2025",
      customer: "Charlie Wilson",
      device: "Dell Laptop",
      issue: "Overheating issue",
      priority: "Medium",
      dueDate: "Tomorrow",
    },
  ]

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div>
        <h1 className="text-3xl font-bold">Front Desk</h1>
        <p className="text-muted-foreground">Dashboard overview and quick actions - P-004</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Acceptances</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayAcceptances}</div>
            <p className="text-xs text-muted-foreground">+2 from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Jobs</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingJobs}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedToday}</div>
            <p className="text-xs text-muted-foreground">Jobs finished</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue}</div>
            <p className="text-xs text-muted-foreground">+12% from yesterday</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Acceptances */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Acceptances</CardTitle>
            <CardDescription>Latest repair job submissions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentAcceptances.map((acceptance) => (
              <div key={acceptance.id} className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">{acceptance.customer}</p>
                  <p className="text-sm text-muted-foreground">{acceptance.device} - {acceptance.issue}</p>
                  <p className="text-xs text-muted-foreground">{acceptance.time}</p>
                </div>
                <Badge variant={acceptance.status === "Completed" ? "default" : acceptance.status === "In Progress" ? "secondary" : "outline"}>
                  {acceptance.status}
                </Badge>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              View All Acceptances
            </Button>
          </CardContent>
        </Card>

        {/* Urgent Jobs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Urgent Jobs
            </CardTitle>
            <CardDescription>Jobs requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {urgentJobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">{job.customer}</p>
                  <p className="text-sm text-muted-foreground">{job.device} - {job.issue}</p>
                  <p className="text-xs text-muted-foreground">Due: {job.dueDate}</p>
                </div>
                <Badge variant={job.priority === "High" ? "destructive" : "secondary"}>
                  {job.priority}
                </Badge>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              View All Urgent Jobs
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common front desk operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button className="h-20 flex-col gap-2">
              <Users className="h-6 w-6" />
              New Acceptance
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Wrench className="h-6 w-6" />
              Search Jobs
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2">
              <CalendarDays className="h-6 w-6" />
              Today's Schedule
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}