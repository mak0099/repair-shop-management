// src/features/customers/mocks/customers.mock.ts

import { Customer } from "../customer.schema";

const generateCustomers = (count: number): Customer[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `cust-${100 + i}`,
    name: `Customer ${i + 1}`,
    email: `customer${i + 1}@example.com`,
    customerTypes: i % 3 === 0 ? "Dealer" : i % 2 === 0 ? "Online Customer" : "Desktop Customer",
    mobile: `+39 333 ${1000000 + i}`,
    branch: { name: i % 2 === 0 ? "Roma Termini" : "Milano Centrale" },
    isActive: i % 5 !== 0,
  }));
};

export const mockCustomers: Customer[] = generateCustomers(55);
