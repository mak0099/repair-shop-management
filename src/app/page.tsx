import { DASHBOARD_FRONTDESK_HREF } from '@/config/paths'
import { redirect } from 'next/navigation'

export default function Home() {
  redirect(DASHBOARD_FRONTDESK_HREF)
}
