"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ACCEPTANCES_LIST_HREF } from '@/config/paths'

export default function Acceptances() {
  const router = useRouter()

  useEffect(() => {
    router.replace(ACCEPTANCES_LIST_HREF)
  }, [router])

  return null
}
