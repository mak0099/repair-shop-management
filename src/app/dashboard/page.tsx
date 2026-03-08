"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DASHBOARD_FRONTDESK_HREF } from '@/config/paths'

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace(DASHBOARD_FRONTDESK_HREF)
  }, [router])

  return null
}
