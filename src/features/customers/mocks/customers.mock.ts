import { Customer } from "../customer.schema"

const generateCustomers = (count: number): Customer[] => {
  const customers: Customer[] = []
  const firstNames = ["John", "Jane", "Alex", "Emily", "Chris", "Katie", "Mario", "Lucia"]
  const lastNames = ["Doe", "Smith", "Rossi", "Williams", "Bianchi", "Jones", "Ricci", "Gallo"]

  for (let i = 0; i < count; i++) {
    const firstName = firstNames[i % firstNames.length]
    const lastName = lastNames[i % lastNames.length]
    customers.push({
      id: `cust-${100 + i}`,
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      mobile: `+39333${String(Math.floor(1000000 + Math.random() * 9000000))}`,
      phone: `+3906${String(Math.floor(1000000 + Math.random() * 9000000))}`,
      isActive: i % 5 !== 0,
      isDealer: i % 3 === 0,
      address: `Via Roma ${i + 1}`,
      city: i % 2 === 0 ? "Roma" : "Milano",
      createdAt: new Date(Date.now() - i * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }
  return customers
}

export const mockCustomers: Customer[] = generateCustomers(50)