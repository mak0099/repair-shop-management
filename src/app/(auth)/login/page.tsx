import { LoginForm } from "@/features/auth/components/login-form"
import { AuthProvider } from "@/features/auth/auth-context"
import { MSWProvider } from "@/providers/msw-provider"

export default function LoginPage() {
  return (
    <MSWProvider>
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    </MSWProvider>
  )
}