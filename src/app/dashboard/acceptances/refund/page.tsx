"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const formSchema = z.object({
  acceptance_id: z.string().min(1, "Acceptance ID is required"),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

export default function GenerateRefundPage() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      acceptance_id: "",
      notes: "",
    },
  })

  const onSubmit = (data: FormData) => {
    console.log("Refund request:", data)
    // Simulate API call
    alert(`Refund processed for Acceptance ID: ${data.acceptance_id}`)
    form.reset()
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div>
        <h1 className="text-3xl font-bold">Generate Refund</h1>
        <p className="text-muted-foreground">Process refunds for repair jobs (P-006)</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Refund Processing</CardTitle>
            <CardDescription>Enter the acceptance ID to initiate a refund</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="acceptance_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Acceptance ID *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 41604-2025" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Defect / Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Reason for refund..." 
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-4 pt-4">
                  <Button type="button" variant="outline" onClick={() => form.reset()}>
                    Reset
                  </Button>
                  <Button type="submit" variant="destructive">
                    Process Refund
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              Processing a refund will create a negative transaction in the financial ledger and update the job status. This action cannot be undone easily.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Recent Refunds</CardTitle>
              <CardDescription>Last 3 processed refunds</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: "41608-2025", amount: 90.00, date: "Today, 10:30 AM" },
                  { id: "41606-2025", amount: 50.00, date: "Yesterday, 2:15 PM" },
                  { id: "41599-2024", amount: 120.00, date: "Jan 12, 2025" },
                ].map((refund, i) => (
                  <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{refund.id}</p>
                      <p className="text-xs text-muted-foreground">{refund.date}</p>
                    </div>
                    <div className="font-bold text-red-600">
                      -${refund.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}