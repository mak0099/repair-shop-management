"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SALES_LIST_HREF } from '@/config/paths'

export default function Sales() {
  const router = useRouter()

  useEffect(() => {
    router.replace(SALES_LIST_HREF)
  }, [router])

  return null
}
