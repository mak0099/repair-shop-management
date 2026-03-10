"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

import { AppSidebar } from "@/components/layout/sidebar"
import { AppTopNav } from "@/components/layout/top-nav"
import { useLayout } from "@/components/layout/layout-context"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const { isTopNav } = useLayout()
  const pathname = usePathname()

  if (isTopNav) {
    return (
      <div className="flex min-h-screen flex-col">
        <AppTopNav />
        <main className="flex-1">
          <div className="container mx-auto p-4">{children}</div>
        </main>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {pathname.split('/').filter(Boolean).map((segment, index, array) => {
                  const href = `/${array.slice(0, index + 1).join('/')}`
                  const title = segment === 'pos' || segment === 'crm' 
                    ? segment.toUpperCase() 
                    : segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
                  const isLast = index === array.length - 1

                  return (
                    <React.Fragment key={href}>
                      <BreadcrumbItem className={!isLast ? "hidden md:block" : ""}>
                        {isLast ? <BreadcrumbPage>{title}</BreadcrumbPage> : <BreadcrumbLink href={href}>{title}</BreadcrumbLink>}
                      </BreadcrumbItem>
                      {!isLast && <BreadcrumbSeparator className="hidden md:block" />}
                    </React.Fragment>
                  )
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}