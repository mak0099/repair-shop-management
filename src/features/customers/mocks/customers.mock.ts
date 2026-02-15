// src/features/customers/mocks/customers.mock.ts

import { Customer } from "../customer.schema";

const generateCustomers = (count: number): Customer[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `cust-${100 + i}`,
    name: `Customer ${i + 1}`,
    mobile: `+39 333 ${1000000 + i}`,
    email: `customer${i + 1}@example.com`,
    isDealer: i % 6 !== 0 && i % 4 !== 0,
    isActive: i % 5 !== 0,
  }));
};

export const mockCustomers: Customer[] = generateCustomers(55);
