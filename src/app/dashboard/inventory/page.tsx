"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { INVENTORY_STOCK_HREF } from '@/config/paths'

export default function Inventory() {
  const router = useRouter()

  useEffect(() => {
    router.replace(INVENTORY_STOCK_HREF)
  }, [router])

  return null
}
