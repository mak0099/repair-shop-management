"use client"

import { useRouter } from "next/navigation"

import { AcceptanceForm } from "@/features/acceptances/components/acceptance-form"
import { PageHeader } from "@/components/shared/page-header"
import { ACCEPTANCES_BASE_HREF } from "@/config/paths"

export default function AddAcceptancePage() {
  const router = useRouter()

  const handleSuccess = () => {
    router.push("/dashboard/acceptances")
  }

  return (
    <div>
      <div className="px-4 md:px-6">
        <PageHeader title="Add Acceptance" description="Create a new repair acceptance record." backHref={ACCEPTANCES_BASE_HREF} />
      </div>
      <AcceptanceForm onSuccess={handleSuccess} />
    </div>
  )
}