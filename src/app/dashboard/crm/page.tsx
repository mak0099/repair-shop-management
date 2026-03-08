"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CUSTOMERS_BASE_HREF } from '@/config/paths'

export default function CRM() {
  const router = useRouter()

  useEffect(() => {
    router.replace(CUSTOMERS_BASE_HREF)
  }, [router])

  return null
}
