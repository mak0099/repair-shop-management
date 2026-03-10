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

        const user = MOCK_USERS.find(
          (u) => u.email === credentials.email && u.password === credentials.password
        )

        if (user && user.isActive) {
          const { ...userWithoutPassword } = user
          // Ensure we return the object structure that matches our User interface
          return {
            ...userWithoutPassword,
            id: user.id,
          }
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
        token.sub = user.id
        token.roleIds = user.roleIds
        token.extraPermissions = user.extraPermissions
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub
        session.user.roleIds = token.roleIds
        session.user.extraPermissions = token.extraPermissions
      }
      return session
    }
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "super-secret-secret",
}