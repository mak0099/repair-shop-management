import { withAuth, NextRequestWithAuth } from "next-auth/middleware";
import { NextRequest, NextFetchEvent } from "next/server";

const authMiddleware = withAuth({
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    authorized: ({ token }) => !!token,
  },
});

export function proxy(req: NextRequest, event: NextFetchEvent) {
  return authMiddleware(req as NextRequestWithAuth, event);
}

export const config = {
  matcher: ["/dashboard/:path*"],
};