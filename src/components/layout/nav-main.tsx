"use client"

import { ChevronRight } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, useSidebar } from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export function NavMain({ items }: { items: any[] }) {
  const pathname = usePathname()
  const { state } = useSidebar()
  
  const isUrlActive = (url?: string) => 
    pathname === url || (url !== '/dashboard' && pathname.startsWith(url + '/'))

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-sidebar-foreground/40 mb-4">
        Menu Navigation
      </SidebarGroupLabel>
      
      <SidebarMenu className="gap-2 px-1 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:items-center">
        {items.map((item) => {
          // ১. চেক করছি এই সেকশনটি কি কোনোভাবে অ্যাক্টিভ কি না
          const sectionActive = isUrlActive(item.url) || item.items?.some((s: any) => isUrlActive(s.url))
          
          // ২. চেক করছি এটা কি সরাসরি অ্যাক্টিভ (Direct Active) নাকি প্যারেন্ট হিসেবে অ্যাক্টিভ
          const isDirectActive = pathname === item.url
          const isParentActive = sectionActive && !isDirectActive
          
          const hasChildren = item.items && item.items.length > 0

          const menuButtonClasses = cn(
            "h-10 rounded-xl px-2.5 transition-all duration-300 relative overflow-hidden group/item border",
            "group-data-[collapsible=icon]:!px-0 group-data-[collapsible=icon]:justify-center",
            isDirectActive ? "shadow-xl border-transparent" : 
            isParentActive ? "border-sidebar-border bg-sidebar-accent/50" : 
            "border-transparent text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/80 hover:translate-x-1"
          );

          const menuButtonStyle = {
            backgroundColor: isDirectActive ? 'var(--sb-primary, var(--primary))' : 'transparent',
            backgroundImage: isDirectActive ? 'var(--sb-primary-gradient, var(--primary-gradient))' : 'none',
            color: isDirectActive ? 'var(--sb-primary-foreground, var(--primary-foreground))' : (isParentActive ? 'var(--sb-primary, var(--primary))' : 'inherit'),
            boxShadow: isDirectActive ? 'var(--sb-button-glow, var(--button-glow))' : 'none',
            transitionDuration: 'var(--animation-speed)'
          } as React.CSSProperties;

          const renderContent = () => (
            <>
              {!isDirectActive && !isParentActive && (
                <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-primary scale-y-0 group-hover/item:scale-y-100 transition-transform duration-300 rounded-r-full opacity-70" />
              )}
              {item.icon && (
                <item.icon className={cn(
                  "size-4 shrink-0 transition-transform duration-300 relative z-10", 
                  sectionActive ? "scale-110" : "group-hover/item:scale-110 group-hover/item:text-primary"
                )} />
              )}
              <span className={cn("text-[11px] tracking-wider ml-2 group-data-[collapsible=icon]:hidden relative z-10 transition-colors duration-300", sectionActive ? "font-black" : "font-bold group-hover/item:text-foreground")}>
                {item.title}
              </span>
              {hasChildren && (
                <ChevronRight className="ml-auto size-3.5 transition-transform group-data-[state=open]/collapsible:rotate-90 opacity-40 group-data-[collapsible=icon]:hidden relative z-10" />
              )}
            </>
          );

          if (hasChildren && state === "collapsed") {
            return (
              <SidebarMenuItem key={item.title}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton tooltip={item.title} className={menuButtonClasses} style={menuButtonStyle}>
                      {item.icon && (
                        <item.icon className={cn(
                          "size-5 shrink-0 transition-transform duration-300", 
                          sectionActive ? "scale-110" : "group-hover/item:scale-110"
                        )} />
                      )}
                      <span className="sr-only">{item.title}</span>
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="start" sideOffset={16} className="w-56 bg-sidebar/95 text-sidebar-foreground backdrop-blur-xl border-sidebar-border shadow-xl rounded-2xl p-2">
                    <div className="p-2 font-black text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{item.title}</div>
                    {item.items.map((subItem: any) => {
                      const subActive = isUrlActive(subItem.url)
                      return subItem.items ? (
                        <DropdownMenuSub key={subItem.title}>
                        <DropdownMenuSubTrigger className={cn("rounded-lg text-[11px] cursor-pointer", subActive && "text-sidebar-primary font-bold")}>
                            <span>{subItem.title}</span>
                          </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="bg-sidebar/95 text-sidebar-foreground backdrop-blur-xl border-sidebar-border shadow-xl rounded-2xl p-2 w-48">
                            {subItem.items.map((nestedItem: any) => {
                              const nestedActive = isUrlActive(nestedItem.url)
                              return (
                              <DropdownMenuItem key={nestedItem.title} asChild className={cn("rounded-md text-[11px] cursor-pointer transition-all mb-0.5", nestedActive ? "font-bold shadow-md" : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent")}>
                                <Link href={nestedItem.url || "#"} style={nestedActive ? { backgroundColor: 'var(--sb-primary, var(--primary))', backgroundImage: 'var(--sb-primary-gradient, var(--primary-gradient))', color: 'var(--sb-primary-foreground, var(--primary-foreground))', boxShadow: 'var(--sb-button-glow, var(--button-glow))' } : {}}>
                                    <span>{nestedItem.title}</span>
                                  </Link>
                                </DropdownMenuItem>
                              )
                            })}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                      ) : (
                      <DropdownMenuItem key={subItem.title} asChild className={cn("rounded-lg text-[11px] cursor-pointer transition-all mb-0.5", subActive ? "font-bold shadow-md" : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent")}>
                        <Link href={subItem.url || "#"} style={subActive ? { backgroundColor: 'var(--sb-primary, var(--primary))', backgroundImage: 'var(--sb-primary-gradient, var(--primary-gradient))', color: 'var(--sb-primary-foreground, var(--primary-foreground))', boxShadow: 'var(--sb-button-glow, var(--button-glow))' } : {}}>
                            <span>{subItem.title}</span>
                          </Link>
                        </DropdownMenuItem>
                      )
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            )
          }

          if (hasChildren) {
            return (
              <Collapsible key={item.title} asChild defaultOpen={sectionActive} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title} className={menuButtonClasses} style={menuButtonStyle}>
                      {renderContent()}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="ml-4 mt-1 border-l-2 border-sidebar-border gap-1 py-1">
                      {item.items.map((subItem: any) => {
                        const subActive = isUrlActive(subItem.url)
                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton 
                              asChild 
                              className={cn(
                                "h-8 rounded-lg px-3 text-[11px] font-bold transition-all",
                                subActive ? "shadow-md" : "text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                              )}
                              style={subActive ? { 
                              backgroundColor: 'var(--sb-primary, var(--primary))',
                              backgroundImage: 'var(--sb-primary-gradient, var(--primary-gradient))', 
                              color: 'var(--sb-primary-foreground, var(--primary-foreground))',
                              boxShadow: 'var(--sb-button-glow, var(--button-glow))' 
                              } : {}}
                            >
                              <Link href={subItem.url || "#"}><span>{subItem.title}</span></Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            )
          }

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title} className={menuButtonClasses} style={menuButtonStyle}>
                <Link href={item.url || "#"}>
                  {renderContent()}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}