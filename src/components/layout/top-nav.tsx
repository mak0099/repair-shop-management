"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LucideIcon, GalleryVerticalEnd } from "lucide-react"
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
import { NavUserMenuContent } from "@/components/layout/nav-user"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSession } from "next-auth/react"

interface NavItem {
  title: string
  url?: string
  icon?: LucideIcon
  items?: {
    title: string
    url?: string
    items?: { title: string; url: string }[]
  }[]
}

export function AppTopNav() {
  const pathname = usePathname()
  const { toggleLayout } = useLayout()
  const { user: initialUser } = data
  const Logo = GalleryVerticalEnd
  const { data: session } = useSession()

  const user = session?.user ? {
    name: session.user.name ?? initialUser.name,
    email: session.user.email ?? initialUser.email,
    avatar: session.user.image ?? initialUser.avatar,
  } : initialUser

  const getIsActive = (item: NavItem): boolean => {
    if (item.url) {
      if (item.url === '/dashboard') {
        return pathname === '/dashboard';
      }
      if (pathname.startsWith(item.url)) {
        return true;
      }
    }
    if (item.items) {
      return item.items.some((subItem) => getIsActive(subItem as NavItem));
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
              TELEFIX
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
              <NavUserMenuContent user={user} />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

  