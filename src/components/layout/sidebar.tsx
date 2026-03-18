"use client";

import * as React from "react";
import { LayoutTemplate, Palette } from "lucide-react";
import { NavMain } from "@/components/layout/nav-main";
import { NavUser } from "@/components/layout/nav-user";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { useLayout } from "@/components/layout/layout-context";
import { BrandLogo } from "@/components/layout/brand-logo";
import { DisplaySettings } from "@/components/theme/display-settings";
import { data } from "./sidebar-data";
import { cn } from "@/lib/utils";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { toggleLayout } = useLayout();

  return (
    <Sidebar
      collapsible="icon"
      {...props}
      /* className এ backdrop-blur এবং custom background-color যোগ করা হয়েছে */
      className="border-r border-sidebar-border transition-all duration-500 [&_[data-sidebar=sidebar]]:backdrop-blur-xl [&_[data-sidebar=sidebar]]:shadow-2xl [&_[data-sidebar=sidebar]]:!bg-[color-mix(in_srgb,var(--sb-sidebar),transparent_5%)]"
      style={{
        /* লোকাল ভেরিয়েবল স্কোপিং: যাতে ভেতরের BrandLogo এবং অন্যান্য কম্পোনেন্ট ডার্ক সাইডবারের কালার পায় */
        '--primary': 'var(--sb-primary, var(--primary))',
        '--primary-foreground': 'var(--sb-primary-foreground, var(--primary-foreground))',
        '--primary-gradient': 'var(--sb-primary-gradient, var(--primary-gradient))',
        '--button-glow': 'var(--sb-button-glow, var(--button-glow))',
        /* Hover এবং Parent Active স্টেটের টেক্সট/ব্যাকগ্রাউন্ড ফিক্স করার জন্য */
        '--foreground': 'var(--sb-foreground, var(--sidebar-foreground))',
        '--muted-foreground': 'var(--sb-muted-foreground, var(--sidebar-foreground))',
        '--accent': 'var(--sb-accent, var(--sidebar-accent))',
        '--accent-foreground': 'var(--sb-accent-foreground, var(--sidebar-accent-foreground))',
      } as React.CSSProperties}
    >
      {/* হেডার সেকশনকে আরও একটু স্বচ্ছ করা হয়েছে */}
      <SidebarHeader className="p-4 bg-sidebar-accent/20 backdrop-blur-md border-b border-sidebar-border/30 group-data-[collapsible=icon]:p-2">
        <SidebarMenu className="gap-3 group-data-[collapsible=icon]:items-center">
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-transparent focus-visible:ring-0 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center">
              <BrandLogo />
            </SidebarMenuButton>
          </SidebarMenuItem>

          <div className="flex gap-2 group-data-[collapsible=icon]:flex-col px-1 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:items-center">
            <DisplaySettings>
              <SidebarMenuButton
                className={cn(
                  "rounded-xl transition-all flex-1 h-9 justify-center border",
                  "bg-sidebar-accent/40 hover:bg-sidebar-accent/60",
                  "text-sidebar-foreground/80 hover:text-sidebar-foreground",
                  "border-sidebar-border/50 px-1"
                )}
                title="Appearance & Themes"
              >
                <Palette className="size-4 shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-tighter group-data-[collapsible=icon]:hidden ml-1.5">
                  Theme
                </span>
              </SidebarMenuButton>
            </DisplaySettings>

            <SidebarMenuButton
              onClick={toggleLayout}
              className={cn(
                "rounded-xl transition-all flex-1 h-9 justify-center border",
                "bg-sidebar-accent/40 hover:bg-sidebar-accent/60",
                "text-sidebar-foreground/80 hover:text-sidebar-foreground",
                "border-sidebar-border/50 px-1"
              )}
              title="Toggle Sidebar Layout"
            >
              <LayoutTemplate className="size-4 shrink-0" />
              <span className="text-[10px] font-black uppercase tracking-tighter group-data-[collapsible=icon]:hidden ml-1.5">
                Layout
              </span>
            </SidebarMenuButton>
          </div>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2 pt-4 scrollbar-hide group-data-[collapsible=icon]:px-0">
        <NavMain items={data.navMain} />
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border/30 bg-sidebar-accent/10 group-data-[collapsible=icon]:p-2">
        <NavUser user={data.user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}