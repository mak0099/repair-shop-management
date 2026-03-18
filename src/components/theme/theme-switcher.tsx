"use client"

import React from "react"
import { useCustomTheme } from "@/hooks/use-custom-theme"
import { useTheme as useNextTheme } from "next-themes"
import { THEMES, ThemeName } from "@/config/themes"
import { Check, Moon, Sun, Monitor, LayoutPanelLeft, LayoutPanelTop } from "lucide-react"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch" // Shadcn Switch ব্যবহার করলে ভালো দেখাবে
import { Label } from "@/components/ui/label"

export function ThemeSwitcher() {
  const { 
    themeName, 
    setThemeName, 
    availableThemes,
    alwaysDarkSidebar, 
    setAlwaysDarkSidebar,
    alwaysDarkTopNav, 
    setAlwaysDarkTopNav 
  } = useCustomTheme()
  const { theme, setTheme } = useNextTheme()

  return (
    <div className="space-y-8 p-1">
      {/* ১. কালার মোড সিলেক্টর */}
      <div>
        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mb-4">Appearance Mode</h4>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: "light", label: "Light", icon: Sun },
            { id: "dark", label: "Dark", icon: Moon },
            { id: "system", label: "System", icon: Monitor },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setTheme(mode.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-2 px-2 py-3 rounded-xl border-2 transition-all",
                theme === mode.id
                  ? "border-primary bg-primary/5 text-primary shadow-sm"
                  : "bg-background hover:bg-muted border-muted text-muted-foreground"
              )}
            >
              <mode.icon className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">{mode.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ২. নেভিগেশন মোড সিলেক্টর (Sidebar & TopNav) */}
      <div className="bg-muted/30 p-4 rounded-2xl space-y-4 border border-border/50">
        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mb-2">Navigation Layout</h4>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-background rounded-lg shadow-sm border border-border/50">
              <LayoutPanelLeft className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col">
              <Label className="text-xs font-bold">Dark Sidebar</Label>
              <span className="text-[10px] text-muted-foreground">Always keep sidebar dark</span>
            </div>
          </div>
          <Switch 
            checked={alwaysDarkSidebar} 
            onCheckedChange={setAlwaysDarkSidebar} 
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-background rounded-lg shadow-sm border border-border/50">
              <LayoutPanelTop className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col">
              <Label className="text-xs font-bold">Dark Top-Nav</Label>
              <span className="text-[10px] text-muted-foreground">Glassmorphism dark effect</span>
            </div>
          </div>
          <Switch 
            checked={alwaysDarkTopNav} 
            onCheckedChange={setAlwaysDarkTopNav} 
          />
        </div>
      </div>

      {/* ৩. কালার প্যালেট সিলেক্টর */}
      <div>
        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mb-4">Color Palette</h4>
        <div className="grid grid-cols-2 gap-3">
          {availableThemes.map((name) => {
            const config = THEMES[name as ThemeName];
            const isActive = themeName === name;

            return (
              <button
                key={name}
                onClick={() => setThemeName(name as ThemeName)}
                className={cn(
                  "relative flex flex-col gap-2 p-3 rounded-xl border-2 transition-all text-left group",
                  isActive
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-muted bg-transparent hover:border-muted-foreground/30"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-wider",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}>
                    {config?.label || name}
                  </span>
                  {isActive && (
                    <div className="bg-primary rounded-full p-0.5 animate-in zoom-in-50 duration-300">
                      <Check className="h-2 w-2 text-primary-foreground" />
                    </div>
                  )}
                </div>

                <div className="flex gap-1.5 mt-1">
                  <div className="h-4 w-4 rounded-md border border-black/5" style={{ background: config.light.primary }} />
                  <div className="h-4 w-4 rounded-md border border-black/5 shadow-inner" style={{ background: config.light.primaryGradient }} />
                  <div className="h-4 w-4 rounded-md border border-white/5" style={{ background: config.dark.background }} />
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}