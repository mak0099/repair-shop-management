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
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { signIn } from "next-auth/react"
import { useShopProfile } from "@/features/shop-profile"
import Image from "next/image"

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: shopProfile } = useShopProfile()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  const displayLogo = shopProfile?.logoUrl || shopProfile?.bannerLogoUrl

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema) as unknown as Resolver<LoginFormValues>,
    defaultValues: { 
      email: MOCK_USERS[0].email, 
      password: MOCK_USERS[0].password, 
      rememberMe: false 
    }
  })

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true)
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      })

      if (result?.error) {
        toast.error("Invalid email or password")
      } else {
        toast.success("Welcome back!")
        router.push(callbackUrl)
      }
    } catch {
      toast.error("Invalid email or password")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4 transition-colors duration-500">
      <Card 
        className="w-full max-w-[400px] border border-border/50 transition-all duration-500 bg-card"
        style={{ boxShadow: 'var(--card-shadow, none)' }}
      >
        <CardHeader className="space-y-1 text-center">
          {displayLogo ? (
            <div className="relative w-48 h-16 mx-auto mb-2">
              <Image
                src={displayLogo}
                alt={shopProfile?.name || "Logo"}
                fill
                className="object-contain"
                priority
              />
            </div>
          ) : (
            <div className="mx-auto bg-primary text-primary-foreground p-3 rounded-2xl w-fit mb-2 shadow-lg">
              <Smartphone className="h-8 w-8" />
            </div>
          )}
          
          <CardTitle className="space-y-2">
            {/* থিম অনুযায়ী গ্রেডিয়েন্ট টাইটেল */}
            <p 
              className="text-3xl font-extrabold bg-clip-text text-transparent transition-all duration-500"
              style={{ backgroundImage: 'var(--primary-gradient)' }}
            >
              {shopProfile?.name || "Mobile Shop Pro"}
            </p>
            {shopProfile?.slogan && (
              <p className="text-sm font-medium text-muted-foreground italic opacity-80">
                {shopProfile.slogan}
              </p>
            )}
          </CardTitle>
          <CardDescription>Enter your credentials to access the dashboard</CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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

              {/* গর্জিয়াস থিম-অ্যাওয়ার বাটন */}
              <Button 
                type="submit" 
                disabled={isLoading}
                className="group relative w-full h-12 text-base font-bold overflow-hidden transition-all border-none"
                style={{ 
                  backgroundImage: 'var(--primary-gradient)',
                  backgroundSize: '200% auto',
                  transitionDuration: 'var(--animation-speed)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--primary-foreground)'
                }}
                // মাউস হোভারে গ্লো এবং স্লাইডিং এনিমেশন
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--button-glow)';
                  e.currentTarget.style.backgroundPosition = 'right center';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.backgroundPosition = 'left center';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <div className="flex items-center justify-center">
                    <Lock className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                    <span>Sign In</span>
                  </div>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}