import { Customer } from "../customer.schema"

/**
 * Generates mock customers ensuring strict alignment with Customer schema.
 * FIX: Replaced 'city' with 'location' and added missing invoicing fields.
 */
const generateCustomers = (count: number): Customer[] => {
  const customers: Customer[] = []
  const firstNames = ["John", "Jane", "Alex", "Emily", "Chris", "Katie", "Mario", "Lucia"]
  const lastNames = ["Doe", "Smith", "Rossi", "Williams", "Bianchi", "Jones", "Ricci", "Gallo"]

  for (let i = 0; i < count; i++) {
    const firstName = firstNames[i % firstNames.length]
    const lastName = lastNames[i % lastNames.length]
    const isDealer = i % 3 === 0

    customers.push({
      id: `cust-${100 + i}`,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      mobile: `+39333${String(Math.floor(1000 + Math.random() * 9000))}`,
      phone: `+3906${String(Math.floor(1000 + Math.random() * 9000))}`,
      
      // Consistency: Boolean flags
      isActive: i % 5 !== 0,
      isDealer: isDealer,
      
      // FIX: Changed 'city' to 'location' and added 'province'
      address: `Via Roma ${i + 1}`,
      location: i % 2 === 0 ? "Roma" : "Milano", // Matches 'location' in schema
      province: i % 2 === 0 ? "RM" : "MI",
      postalCode: String(10100 + i),

      // Added Italian invoicing fields to match the schema fully
      fiscalCode: `FSCMRA${80 + i}A01H501U`.slice(0, 16),
      vat: isDealer ? `IT${10000000000 + i}` : undefined,
      sdiCode: isDealer ? "1234567" : undefined,
      pecEmail: isDealer ? `${firstName.toLowerCase()}@legalmail.it` : "",

      createdAt: new Date(Date.now() - i * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }
  return customers
}

export const mockCustomers: Customer[] = generateCustomers(50)