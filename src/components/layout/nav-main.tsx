"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url?: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url?: string
      items?: {
        title: string
        url: string
      }[]
    }[]
  }[]
}) {
  const pathname = usePathname()
  const { state: sidebarState } = useSidebar()

  const isUrlActive = (url?: string) => {
    if (!url) return false
    return pathname === url || pathname.startsWith(url + '/')
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isGroupActive = (item: any): boolean => {
    if (isUrlActive(item.url)) return true
    if (item.items) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return item.items.some((subItem: any) => {
        if (isUrlActive(subItem.url)) return true
        if (subItem.items) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return subItem.items.some((nestedItem: any) => isUrlActive(nestedItem.url))
        }
        return false
      })
    }
    return false
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const groupActive = isGroupActive(item)

          if (!item.items) {
            const active = isUrlActive(item.url)
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={active}
                  className={active ? "data-[active=true]:bg-primary/10 data-[active=true]:text-primary font-medium" : ""}
                >
                  <Link href={item.url || "#"}>
                    {item.icon && <item.icon />}
                    <span className="truncate">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          }

          if (sidebarState === 'collapsed') {
            return (
              <DropdownMenu key={item.title}>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton tooltip={item.title} isActive={groupActive}>
                    {item.icon && <item.icon />}
                    <span className="sr-only">{item.title}</span>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="start" sideOffset={10}>
                  <div className="p-2 font-medium text-sm">{item.title}</div>
                  {item.items.map((subItem) =>
                    subItem.items ? (
                      <DropdownMenuSub key={subItem.title}>
                        <DropdownMenuSubTrigger>
                          <span>{subItem.title}</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          {subItem.items.map((nestedItem) => (
                            <DropdownMenuItem key={nestedItem.title} asChild>
                              <Link href={nestedItem.url}>{nestedItem.title}</Link>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    ) : (
                      <DropdownMenuItem key={subItem.title} asChild>
                        <Link href={subItem.url!}>{subItem.title}</Link>
                      </DropdownMenuItem>
                    )
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )
          }

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={groupActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton 
                    tooltip={item.title} 
                    isActive={groupActive}
                    className={groupActive ? "font-medium text-primary" : ""}
                  >
                    {item.icon && <item.icon />}
                    <span className="truncate">{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        {subItem.items ? (
                          <Collapsible>
                            <CollapsibleTrigger asChild>
                              <SidebarMenuSubButton 
                                isActive={isUrlActive(subItem.url)}
                                className={isUrlActive(subItem.url) ? "font-medium text-primary" : ""}
                              >
                                <span className="truncate">{subItem.title}</span>
                                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                              </SidebarMenuSubButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <SidebarMenuSub>
                                {subItem.items.map((nestedItem) => (
                                  <SidebarMenuSubItem key={nestedItem.title}>
                                    <SidebarMenuSubButton 
                                      asChild 
                                      isActive={isUrlActive(nestedItem.url)}
                                      className={isUrlActive(nestedItem.url) ? "data-[active=true]:bg-primary/10 data-[active=true]:text-primary font-medium" : ""}
                                    >
                                      <Link href={nestedItem.url || "#"}>
                                        <span className="truncate">{nestedItem.title}</span>
                                      </Link>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                ))}
                              </SidebarMenuSub>
                            </CollapsibleContent>
                          </Collapsible>
                        ) : (
                          <SidebarMenuSubButton 
                            asChild 
                            isActive={isUrlActive(subItem.url)}
                            className={isUrlActive(subItem.url) ? "data-[active=true]:bg-primary/10 data-[active=true]:text-primary font-medium" : ""}
                          >
                            <Link href={subItem.url || "#"}>
                              <span className="truncate">{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        )}
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}