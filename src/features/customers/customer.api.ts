import { useQuery } from "@tanstack/react-query"

import { createApiHooksFor } from "@/lib/api-factory"
import { createBulkDeleteHook, createBulkUpdateHook } from "@/lib/api-bulk-hooks"
import { apiClient } from "@/lib/api-client"
import type { Customer } from "./customer.schema"
import type { CustomerFormValues } from "./customer.schema"

const customerApiHooks = createApiHooksFor<Customer, CustomerFormValues>("customers")

interface CustomerOption {
  id: string
  name: string
  mobile: string
}

export const useCustomers = customerApiHooks.useGetList
export const useCustomerOptions = () => {
  return useQuery<CustomerOption[], Error>({
    queryKey: ["customer-options"],
    queryFn: async () => (await apiClient.get("/customers/options")).data,
  })
}
export const useCreateCustomer = customerApiHooks.useCreate
export const useUpdateCustomer = customerApiHooks.useUpdate
export const useDeleteCustomer = customerApiHooks.useDelete

export const useDeleteManyCustomers = createBulkDeleteHook<Customer>("customers")
export const useUpdateManyCustomers = createBulkUpdateHook<Customer>("customers")
export const useCustomer = customerApiHooks.useGetOne