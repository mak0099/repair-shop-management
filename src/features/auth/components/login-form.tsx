"use client"

import { useState } from "react"
import { Resolver, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, LoginFormValues, MOCK_USERS } from "../index"
import { TextField } from "@/components/forms/text-field"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Smartphone, Lock, Loader2 } from "lucide-react"
import { useAuth } from "../auth-context"
import { loginWithEmailAndPassword } from "../auth.api"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema) as unknown as Resolver<LoginFormValues>,
    defaultValues: { email: MOCK_USERS[0].email, password: MOCK_USERS[0].password, rememberMe: false }
  })

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true)
      const user = await loginWithEmailAndPassword(data)
      login(user)
      toast.success("Welcome back!")
      router.push("/dashboard")
    } catch (error) {
      toast.error("Invalid email or password")
    } finally {
      setIsLoading(false)
    }
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <TextField 
                control={form.control} 
                name="email" 
                label="Email Address" 
                placeholder="admin@shop.com" 
              />
              <TextField 
                control={form.control} 
                name="password" 
                label="Password" 
                type="password" 
                placeholder="••••••••" 
              />
              
              <Button type="submit" className="w-full bg-slate-900 h-11 text-base font-bold" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />} 
                Sign In
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}