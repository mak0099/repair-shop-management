"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const data = [
  { date: '2024-01-01', contanti: 500, carta: 300, paypal: 100, bonifico: 200, totalIn: 1100, expense: 400, profit: 700 },
  { date: '2024-01-02', contanti: 600, carta: 400, paypal: 150, bonifico: 250, totalIn: 1400, expense: 450, profit: 950 },
  { date: '2024-01-03', contanti: 550, carta: 350, paypal: 120, bonifico: 180, totalIn: 1200, expense: 380, profit: 820 },
  { date: '2024-01-04', contanti: 700, carta: 500, paypal: 200, bonifico: 300, totalIn: 1700, expense: 520, profit: 1180 },
  { date: '2024-01-05', contanti: 650, carta: 450, paypal: 180, bonifico: 220, totalIn: 1500, expense: 480, profit: 1020 },
]

export default function KhataOnlinePage() {
  const [branch, setBranch] = useState("")
  const [reportBy, setReportBy] = useState("date")
  const [selectedDate, setSelectedDate] = useState("")

  const handleSearch = () => {
    // In a real app, this would fetch data based on filters
    console.log({ branch, reportBy, selectedDate })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Khata Online</h1>
        <p className="text-muted-foreground">Financial summary and profit/loss report</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
          <CardDescription>Select branch and time period for the report</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="branch">Branch</Label>
              <Select value={branch} onValueChange={setBranch}>
                <SelectTrigger>
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">Main Branch</SelectItem>
                  <SelectItem value="branch1">Branch 1</SelectItem>
                  <SelectItem value="branch2">Branch 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>View Report By</Label>
              <RadioGroup value={reportBy} onValueChange={setReportBy} className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="date" id="date" />
                  <Label htmlFor="date">Date</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="month" id="month" />
                  <Label htmlFor="month">Month</Label>
                </div>
              </RadioGroup>
            </div>
            <div>
              <Label htmlFor="date">{reportBy === 'date' ? 'Date' : 'Month'}</Label>
              <Input
                id="date"
                type={reportBy === 'date' ? 'date' : 'month'}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={handleSearch}>Search</Button>
        </CardContent>
      </Card>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Profit/Loss Trends</CardTitle>
          <CardDescription>Visual representation of financial performance over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="totalIn" stroke="#8884d8" name="Total Income" />
              <Line type="monotone" dataKey="expense" stroke="#82ca9d" name="Expenses" />
              <Line type="monotone" dataKey="profit" stroke="#ffc658" name="Profit" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Summary</CardTitle>
          <CardDescription>Detailed breakdown of income and expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Contanti</TableHead>
                <TableHead>Carta</TableHead>
                <TableHead>Paypal</TableHead>
                <TableHead>Bonifico</TableHead>
                <TableHead>Total - IN</TableHead>
                <TableHead>Expense</TableHead>
                <TableHead>Total - Out</TableHead>
                <TableHead>Profit / Loss</TableHead>
                <TableHead>In Hand</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>${row.contanti}</TableCell>
                  <TableCell>${row.carta}</TableCell>
                  <TableCell>${row.paypal}</TableCell>
                  <TableCell>${row.bonifico}</TableCell>
                  <TableCell>${row.totalIn}</TableCell>
                  <TableCell>${row.expense}</TableCell>
                  <TableCell>${row.expense}</TableCell>
                  <TableCell className={row.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                    ${row.profit}
                  </TableCell>
                  <TableCell>${row.contanti - row.expense}</TableCell>
                </TableRow>
              ))}
              <TableRow className="font-bold">
                <TableCell>Total</TableCell>
                <TableCell>${data.reduce((sum, row) => sum + row.contanti, 0)}</TableCell>
                <TableCell>${data.reduce((sum, row) => sum + row.carta, 0)}</TableCell>
                <TableCell>${data.reduce((sum, row) => sum + row.paypal, 0)}</TableCell>
                <TableCell>${data.reduce((sum, row) => sum + row.bonifico, 0)}</TableCell>
                <TableCell>${data.reduce((sum, row) => sum + row.totalIn, 0)}</TableCell>
                <TableCell>${data.reduce((sum, row) => sum + row.expense, 0)}</TableCell>
                <TableCell>${data.reduce((sum, row) => sum + row.expense, 0)}</TableCell>
                <TableCell className={data.reduce((sum, row) => sum + row.profit, 0) >= 0 ? 'text-green-600' : 'text-red-600'}>
                  ${data.reduce((sum, row) => sum + row.profit, 0)}
                </TableCell>
                <TableCell>${data.reduce((sum, row) => sum + (row.contanti - row.expense), 0)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}