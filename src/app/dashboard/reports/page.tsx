"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { REPORTS_SALE_HREF } from '@/config/paths'

export default function Reports() {
  const router = useRouter()

  useEffect(() => {
    router.replace(REPORTS_SALE_HREF)
  }, [router])

  return null
}
