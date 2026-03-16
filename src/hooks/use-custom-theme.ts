import { useTheme } from "@/providers/theme-provider"
import { THEME_NAMES, getThemeColors } from "@/config/themes"
import { useTheme as useNextTheme } from "next-themes"

export function useCustomTheme() {
  const { 
    themeName, 
    setThemeName, 
    isDark,
    // [ADDED] নতুন এই প্রপার্টিগুলো ডেসট্রাকচার করতে হবে
    alwaysDarkSidebar,
    setAlwaysDarkSidebar,
    alwaysDarkTopNav,
    setAlwaysDarkTopNav
  } = useTheme()
  
  const { theme } = useNextTheme()

  // বর্তমান থিমের কালার অবজেক্ট সরাসরি পাওয়ার জন্য
  const colors = getThemeColors(themeName, isDark)
  const availableThemes = THEME_NAMES

  return {
    themeName,
    setThemeName,
    isDark,
    colors,
    availableThemes,
    currentMode: theme,
    // [ADDED] এগুলো রিটার্ন না করলে ThemeSwitcher এ এরর আসবে
    alwaysDarkSidebar,
    setAlwaysDarkSidebar,
    alwaysDarkTopNav,
    setAlwaysDarkTopNav
  }
}