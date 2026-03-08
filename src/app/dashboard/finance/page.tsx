"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { EXPENSES_BASE_HREF } from '@/config/paths'

export default function Finance() {
  const router = useRouter()

  useEffect(() => {
    router.replace(EXPENSES_BASE_HREF)
  }, [router])

  return null
}
