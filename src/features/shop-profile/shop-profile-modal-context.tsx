"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ShopProfile } from "./shop-profile.schema"
import { ShopProfileForm } from "./components/shop-profile-form"

interface ShopProfileModalContextType {
  openModal: (args?: { initialData?: ShopProfile | null }) => void
  closeModal: () => void
}

const ShopProfileModalContext = createContext<ShopProfileModalContextType | undefined>(undefined)

export function ShopProfileProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [initialData, setInitialData] = useState<ShopProfile | null>(null)

  const openModal = useCallback(({ initialData = null } = {}) => {
    setInitialData(initialData)
    setIsOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsOpen(false)
  }, [])

  return (
    <ShopProfileModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {initialData ? "Edit Shop Profile" : "Setup Shop Profile"}
            </DialogTitle>
          </DialogHeader>
          
          <ShopProfileForm 
            initialData={initialData} 
            onSuccess={() => closeModal()} 
            onCancel={() => closeModal()}
          />
        </DialogContent>
      </Dialog>
    </ShopProfileModalContext.Provider>
  )
}

export function useShopProfileModal() {
  const context = useContext(ShopProfileModalContext)
  if (!context) {
    throw new Error("useShopProfileModal must be used within a ShopProfileProvider")
  }
  return context
}