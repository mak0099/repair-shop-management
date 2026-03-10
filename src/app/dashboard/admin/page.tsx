"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SHOP_PROFILE_BASE_HREF } from '@/config/paths'

export default function Admin() {
  const router = useRouter()

  useEffect(() => {
    router.replace(SHOP_PROFILE_BASE_HREF)
  }, [router])

  return null
}
