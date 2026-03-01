"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, LoginFormValues } from "@/features/auth"
import { TextField } from "@/components/forms/text-field"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Smartphone, Lock } from "lucide-react"

export default function LoginPage() {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false }
  })

  const onSubmit = (data: LoginFormValues) => {
    console.log("Login Data:", data)
    // এখানে আপনার এপিআই কল হবে
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-[400px] shadow-xl border-none">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto bg-slate-900 text-white p-3 rounded-2xl w-fit mb-4">
            <Smartphone className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold">Mobile Shop Pro</CardTitle>
          <CardDescription>Enter your credentials to access the dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <TextField control={form.control} name="email" label="Email Address" placeholder="admin@shop.com" />
            <TextField control={form.control} name="password" label="Password" type="password" placeholder="••••••••" />
            
            <Button type="submit" className="w-full bg-slate-900 h-11 text-base font-bold">
              <Lock className="mr-2 h-4 w-4" /> Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}