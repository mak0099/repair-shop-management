"use client"

import { createContext, useContext, useState, ReactNode, useEffect, useMemo } from "react"
import { User } from "./auth.schema"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (userData: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * AuthProvider manages the global authentication state.
 * It synchronizes user data with localStorage and handles initial hydration.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize authentication state on client-side mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem("auth_user")
        if (storedUser) {
          // Parse and set the user if data exists in storage
          setUser(JSON.parse(storedUser))
        }
      } catch (error) {
        // Handle potential JSON parsing errors or corrupted storage data
        console.error("Auth initialization failed:", error)
        localStorage.removeItem("auth_user") 
      } finally {
        // Ensure loading state is disabled regardless of outcome to prevent app hang
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  /**
   * Updates the user state and persists it to localStorage
   */
  const login = (userData: User) => {
    setUser(userData)
    localStorage.setItem("auth_user", JSON.stringify(userData))
  }

  /**
   * Clears the user state and removes data from localStorage
   */
  const logout = () => {
    setUser(null)
    localStorage.removeItem("auth_user")
  }

  // Memoize the context value to prevent unnecessary re-renders of consuming components
  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout
  }), [user, isLoading])

  return (
    <AuthContext.Provider value={value}>
      {/* Preventing Hydration Mismatch: 
        We only render children once the initial loading/syncing with localStorage is complete.
      */}
      {!isLoading ? children : null}
    </AuthContext.Provider>
  )
}

/**
 * Custom hook to access authentication context
 */
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}