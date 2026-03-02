import { LayoutProvider } from "@/components/layout/layout-context"
import { DashboardLayoutContent } from "@/components/layout/dashboard-layout"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <LayoutProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </LayoutProvider>
  )
}