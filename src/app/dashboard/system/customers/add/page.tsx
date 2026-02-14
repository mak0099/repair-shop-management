import { PageHeader } from "@/components/shared/page-header"
import { CustomerForm } from "@/features/customers"
import { CUSTOMERS_BASE_HREF } from "@/config/paths"

export default function AddCustomerPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Customer"
        description="Register a new customer"
        backHref={CUSTOMERS_BASE_HREF}
      />
      <CustomerForm />
    </div>
  )
}