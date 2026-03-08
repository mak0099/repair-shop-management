import { LayoutProvider } from "@/components/layout/layout-context"
import { DashboardLayoutContent } from "@/components/layout/dashboard-layout"
import { ClientThemeProvider } from "@/components/layout/client-theme-provider"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  /**
   * In a production SaaS environment, 'client1' would be dynamic.
   * It could be fetched from:
   * 1. The user's organization ID in the session/JWT.
   * 2. The subdomain (e.g., shopname.telefix.it).
   * 3. A database call after the user logs in.
   */
  const currentClientKey = "client1";

  return (
    <ClientThemeProvider clientKey={currentClientKey}>
      <LayoutProvider>
        {/* DashboardLayoutContent usually contains the Sidebar and Navbar */}
        <DashboardLayoutContent>
          {children}
        </DashboardLayoutContent>
      </LayoutProvider>
    </ClientThemeProvider>
  )
}