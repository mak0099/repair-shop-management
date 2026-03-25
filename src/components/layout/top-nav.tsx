"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LucideIcon, LayoutTemplate, Palette } from "lucide-react"
import { cn } from "@/lib/utils"
import { data } from "./sidebar-data"; 
import { useLayout } from "@/components/layout/layout-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"
import { NavUserMenuContent } from "@/components/layout/nav-user"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { BrandLogo } from "@/components/layout/brand-logo"
import { DisplaySettings } from "@/components/theme/display-settings" // নতুন ইম্পোর্ট 👈

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
  const { data: session } = useSession()

  const user = session?.user ? {
    name: session.user.name ?? initialUser.name,
    email: session.user.email ?? initialUser.email,
    avatar: session.user.image ?? initialUser.avatar,
  } : initialUser

  const getIsActive = (item: NavItem): boolean => {
    if (item.items && item.items.some((subItem) => getIsActive(subItem as NavItem))) {
      return true;
    }
    if (item.url) {
      if (item.url === '/dashboard') return pathname === '/dashboard';
      return pathname.startsWith(item.url);
    }
    return false;
  }

  const isUrlActive = (url?: string) => {
    if (!url) return false
    if (url === '/dashboard') return pathname === '/dashboard'
    return pathname === url || pathname.startsWith(url + '/')
  }

  return (
    <header 
      className="sticky top-0 z-50 w-full border-b transition-all duration-500 shadow-sm backdrop-blur-lg"
      style={{ 
        backgroundColor: 'color-mix(in srgb, var(--tn-top-nav), transparent 5%)',
        color: 'var(--tn-top-nav-foreground)',
        borderColor: 'color-mix(in srgb, var(--tn-top-nav-border), transparent 50%)',
        /* লোকাল ভেরিয়েবল স্কোপিং: যাতে ভেতরের সব কম্পোনেন্ট ডার্ক মোডের কালার পায় */
        '--foreground': 'var(--tn-foreground)',
        '--muted-foreground': 'var(--tn-muted-foreground)',
        '--primary': 'var(--tn-primary)',
        '--primary-foreground': 'var(--tn-primary-foreground)',
        '--primary-gradient': 'var(--tn-primary-gradient)',
        '--button-glow': 'var(--tn-button-glow)',
        /* Hover, Dropdown Menu এবং Card এর জন্য কালার ফিক্স */
        '--accent': 'var(--tn-accent, var(--accent))',
        '--accent-foreground': 'var(--tn-accent-foreground, var(--accent-foreground))',
        '--card': 'var(--tn-card, var(--card))',
        '--card-foreground': 'var(--tn-card-foreground, var(--card-foreground))',
        '--border': 'var(--tn-border, var(--border))',
      } as React.CSSProperties}
    >
      <div className="container flex h-20 items-center justify-between px-6 mx-auto">
        <div className="flex items-center flex-1">
          <Link href="/dashboard" className="mr-8 transition-transform hover:scale-105 shrink-0">
            <BrandLogo />
          </Link>
          
          <nav className="hidden lg:flex items-center gap-2.5">
            {data.navMain.map((item) => {
              const isActive = getIsActive(item as NavItem);
              
              const itemBaseClasses = cn(
                "relative flex flex-col items-center justify-center h-18 w-20 lg:w-24 rounded-2xl px-1 py-1 transition-all duration-300 group overflow-hidden border",
                isActive 
                  ? "shadow-lg" 
                  : "text-muted-foreground hover:text-foreground hover:bg-foreground/5 hover:-translate-y-0.5 hover:shadow-md"
              );

              const itemDynamicStyle = {
                /* ১. সলিড ব্যাকগ্রাউন্ড (ক্লাসিক মোড বা গ্রেডিয়েন্ট লোড না হলে ফলব্যাক) */
                backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                /* ২. গ্রেডিয়েন্ট থাকলে সলিড কালারের উপরে বসবে */
                backgroundImage: isActive ? 'var(--primary-gradient)' : 'none',
                /* ৩. টেক্সট কন্ট্রাস্ট নিশ্চিত করা */
                color: isActive ? 'var(--primary-foreground)' : 'inherit',
                boxShadow: isActive ? 'var(--button-glow)' : 'none',
                borderWidth: isActive ? '0' : 'auto',
                borderColor: isActive ? 'transparent' : 'color-mix(in srgb, var(--tn-top-nav-border), transparent 10%)',
              } as React.CSSProperties;

              const renderContent = () => (
                <>
                  {item.icon && <item.icon className={cn("h-5 w-5 mb-1 transition-transform group-hover:scale-110", isActive && "animate-pulse-slow")} />}
                  <span className={cn("text-center text-[11px] font-semibold tracking-wide leading-tight px-1 line-clamp-2")}>
                    {item.title}
                  </span>
                  {!isActive && (
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none bg-gradient-to-t from-primary/10 to-transparent translate-y-full group-hover:translate-y-0" />
                  )}
                </>
              );

              return item.items ? (
                <DropdownMenu key={item.title}>
                  <DropdownMenuTrigger asChild>
                    <button className={itemBaseClasses} style={itemDynamicStyle}>
                      {renderContent()}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="min-w-48 p-2 rounded-2xl bg-card/90 backdrop-blur-xl border-border shadow-xl">
                    {item.items.map((subItem) =>
                      'items' in subItem && Array.isArray(subItem.items) ? (
                        <DropdownMenuSub key={subItem.title}>
                          <DropdownMenuSubTrigger className={cn("rounded-lg", subItem.items?.some(i => isUrlActive(i.url)) && "text-primary font-bold")}>
                            {subItem.title}
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent className="p-2 rounded-xl bg-card/90 backdrop-blur-xl">
                            {subItem.items.map((nestedItem) => (
                              <DropdownMenuItem key={nestedItem.title} asChild>
                                <Link 
                                  href={nestedItem.url || "#"}
                                  className={cn("rounded-md px-3 py-2 cursor-pointer transition-colors", isUrlActive(nestedItem.url) && "bg-primary/10 text-primary font-black")}
                                >
                                  {nestedItem.title}
                                </Link>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                      ) : (
                        <DropdownMenuItem key={subItem.title} asChild>
                          <Link 
                            href={subItem.url || "#"}
                            className={cn("rounded-lg px-3 py-2 cursor-pointer transition-colors", isUrlActive(subItem.url) && "bg-primary/10 text-primary font-black")}
                          >
                            {subItem.title}
                          </Link>
                        </DropdownMenuItem>
                      )
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link key={item.title} href={item.url || "#"} className={itemBaseClasses} style={itemDynamicStyle}>
                  {renderContent()}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {/* ডিসপ্লে সেটিংস শিট (Theme/Appearance এর বদলে Palette আইকন) */}
          <DisplaySettings>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-xl hover:bg-foreground/10 text-inherit transition-colors"
              title="Appearance & Themes"
            >
              <Palette className="h-5 w-5" />
            </Button>
          </DisplaySettings>

          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-xl hover:bg-foreground/10 text-inherit transition-colors"
            onClick={toggleLayout} 
            title="Toggle Sidebar Layout"
          >
            <LayoutTemplate className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-10 w-10 cursor-pointer border-2 border-primary/20 hover:border-primary/50 transition-all shadow-md">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-primary/10 font-bold text-primary">AU</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 mt-2 p-2 rounded-2xl shadow-xl border-border bg-card/80 backdrop-blur-xl">
              <NavUserMenuContent user={user} />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}