"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet"
import { ThemeSwitcher } from "@/components/theme/theme-switcher" // সঠিক পাথ 👈
import { Palette } from "lucide-react"

export function DisplaySettings({ children }: { children: React.ReactNode }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="w-[350px] sm:w-[450px] border-l border-sidebar-border bg-card/95 backdrop-blur-xl overflow-y-auto scrollbar-hide">
        <SheetHeader className="pb-6 border-b border-sidebar-border/50 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Palette className="h-5 w-5 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-xl font-black uppercase tracking-widest text-foreground">
                Display
              </SheetTitle>
              <SheetDescription className="text-[10px] uppercase font-bold tracking-tighter opacity-60">
                Customize your dashboard experience
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>
        
        {/* মেইন ইঞ্জিন রেন্ডার হচ্ছে */}
        <ThemeSwitcher /> 
        
      </SheetContent>
    </Sheet>
  )
}