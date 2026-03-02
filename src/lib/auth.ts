import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { MOCK_USERS } from "@/features/auth/mocks/auth.mock"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        // এখানে আমরা সরাসরি মক ডাটা চেক করছি।
        // রিয়েল ব্যাকএন্ড আসলে এখানে API কল হবে।
        const user = MOCK_USERS.find(
          (u) => u.email === credentials.email && u.password === credentials.password
        )

        if (user) {
          const { password, ...userWithoutPassword } = user
          return userWithoutPassword
        }

        return null
      }
    })
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.permissions = user.permissions
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string
        session.user.role = token.role
        session.user.permissions = token.permissions
      }
      return session
    }
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "super-secret-secret", // .env ফাইলে NEXTAUTH_SECRET রাখবেন
}