"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { data } from "@/components/layout/sidebar"
import { useLayout } from "@/components/layout/layout-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LayoutDashboard, LogOut } from "lucide-react"

export function AppTopNav() {
  const pathname = usePathname()
  const { toggleLayout } = useLayout()
  const { user, teams } = data
  const { logo: Logo } = teams[0]

  const getIsActive = (item: any): boolean => {
    if (item.url) {
      if (item.url === '/dashboard') {
        return pathname === '/dashboard';
      }
      if (pathname.startsWith(item.url)) {
        return true;
      }
    }
    if (item.items) {
      return item.items.some(getIsActive);
    }
    return false;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between px-4">
        <div className="mr-4 hidden md:flex items-center">
          <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Logo className="size-4" />
            </div>
            <span className="hidden font-bold sm:inline-block">
              {teams[0].name}
            </span>
          </Link>
          <nav className="flex items-center space-x-2 text-[11px] font-medium">
            {data.navMain.map((item) => {
              const isActive = getIsActive(item);
              const itemClasses = cn(
                "transition-colors flex flex-col items-center justify-center h-16 w-24 border rounded-md px-2 py-1 group",
                isActive
                  ? "border-primary text-primary bg-primary/10"
                  : "border-border/50 text-foreground/60 hover:border-primary/50 hover:text-foreground"
              );

              return item.items ? (
                <DropdownMenu key={item.title}>
                  <DropdownMenuTrigger asChild>
                    <button className={itemClasses}>
                      {item.icon && <item.icon className="h-7 w-7 mb-1" />}
                      <span className="text-center text-[11px] leading-tight">{item.title}</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {item.items.map((subItem) =>
                      'items' in subItem && Array.isArray(subItem.items) ? (
                        <DropdownMenuSub key={subItem.title}>
                          <DropdownMenuSubTrigger>
                            {subItem.title}
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            {subItem.items.map((nestedItem) => (
                              <DropdownMenuItem key={nestedItem.title} asChild>
                                <Link href={nestedItem.url || "#"}>
                                  {nestedItem.title}
                                </Link>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                      ) : (
                        <DropdownMenuItem key={subItem.title} asChild>
                          <Link href={subItem.url || "#"}>{subItem.title}</Link>
                        </DropdownMenuItem>
                      )
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link key={item.title} href={item.url || "#"} className={itemClasses}>
                  {item.icon && <item.icon className="h-7 w-7 mb-1" />}
                  <span className="text-center text-[11px] leading-tight">{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>AU</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={toggleLayout}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Switch to Sidebar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

  