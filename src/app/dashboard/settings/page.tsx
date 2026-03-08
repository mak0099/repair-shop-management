"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { USER_PROFILE_BASE_HREF } from '@/config/paths'

export default function Settings() {
  const router = useRouter()

  useEffect(() => {
    router.replace(USER_PROFILE_BASE_HREF)
  }, [router])

  return null
}
