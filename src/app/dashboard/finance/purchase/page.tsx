import { PurchaseList } from "@/features/purchases"

export default function PurchasePage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PurchaseList />
    </div>
  )
}