import { LayoutProvider } from "@/components/layout/layout-context"
import { DashboardLayoutContent } from "@/components/layout/dashboard-layout"
import { MSWProvider } from "@/providers/msw-provider"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <MSWProvider>
      <LayoutProvider>
        <DashboardLayoutContent>{children}</DashboardLayoutContent>
      </LayoutProvider>
    </MSWProvider>
  )
}