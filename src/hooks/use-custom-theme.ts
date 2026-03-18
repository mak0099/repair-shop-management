import { useTheme } from "@/providers/theme-provider"
import { THEME_NAMES } from "@/config/themes"
import { useTheme as useNextTheme } from "next-themes"

export function useCustomTheme() {
  const { 
    themeName, 
    setThemeName, 
    isDark,
    alwaysDarkSidebar,
    setAlwaysDarkSidebar,
    alwaysDarkTopNav,
    setAlwaysDarkTopNav
  } = useTheme()
  
  const { theme } = useNextTheme()

  const availableThemes = THEME_NAMES

  return {
    themeName,
    setThemeName,
    isDark,
    availableThemes,
    currentMode: theme,
    alwaysDarkSidebar,
    setAlwaysDarkSidebar,
    alwaysDarkTopNav,
    setAlwaysDarkTopNav
  }
}