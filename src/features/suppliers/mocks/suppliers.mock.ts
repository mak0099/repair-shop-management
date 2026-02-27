import { Supplier } from "../supplier.schema"

const generateSuppliers = (count: number): Supplier[] => {
  const suppliers: Supplier[] = []
  const companies = ["TechParts Inc.", "Gadgetron", "Component Solutions", "Global Electronics", "Innovate Supplies"]
  const contacts = ["Alice", "Bob", "Charlie", "Diana", "Eve"]

  for (let i = 0; i < count; i++) {
    const companyName = `${companies[i % companies.length]} ${i >= companies.length ? Math.floor(i / companies.length) + 1 : ''}`.trim()
    suppliers.push({
      id: `sup-${200 + i}`,
      company_name: companyName,
      contact_person: `${contacts[i % contacts.length]} Smith`,
      email: `${contacts[i % contacts.length].toLowerCase()}@${companyName.split(' ')[0].toLowerCase().replace('.', '')}.com`,
      phone: `+1-555-${String(Math.floor(1000000 + Math.random() * 9000000)).substring(0, 7)}`,
      vat_number: `GB${String(Math.floor(100000000 + Math.random() * 900000000))}`,
      address: `${i + 1} Supply Street`,
      city: i % 2 === 0 ? "London" : "Manchester",
      isActive: i % 6 !== 0,
      createdAt: new Date(Date.now() - i * 3 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }
  return suppliers
}

export const mockSuppliers: Supplier[] = generateSuppliers(25)
