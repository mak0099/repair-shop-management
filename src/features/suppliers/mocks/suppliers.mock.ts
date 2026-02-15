import { Supplier } from "../supplier.schema"

const supplierData = [
  { company_name: "Apple Parts Inc.", contact_person: "Tim Parts", email: "parts@apple.com", phone: "123-456-7890", vat_number: "US123456789", address: "1 Infinite Loop", city: "Cupertino" },
  { company_name: "Samsung Components", contact_person: "Jay Lee", email: "components@samsung.com", phone: "098-765-4321", vat_number: "KR987654321", address: "Samsung Town", city: "Seoul" },
  { company_name: "General Screens Co.", contact_person: "John Screen", email: "screens@general.com", phone: "555-555-5555", vat_number: "GB123456789", address: "123 Screen Street", city: "London" },
];

const generateSuppliers = (count: number): Supplier[] => {
  const suppliers: Supplier[] = [];
  for (let i = 0; i < count; i++) {
    const supplierInfo = supplierData[i % supplierData.length];
    const isDuplicate = i >= supplierData.length;
    suppliers.push({
      id: `sup-${String(100 + i).padStart(3, '0')}`,
      company_name: isDuplicate ? `${supplierInfo.company_name} ${Math.floor(i / supplierData.length) + 1}` : supplierInfo.company_name,
      contact_person: supplierInfo.contact_person,
      email: isDuplicate ? `sup${i}@example.com` : supplierInfo.email,
      phone: supplierInfo.phone,
      vat_number: supplierInfo.vat_number,
      address: supplierInfo.address,
      city: supplierInfo.city,
      isActive: i % 10 !== 0,
      createdAt: new Date(Date.now() - (count - i) * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - (count - i) * 12 * 60 * 60 * 1000).toISOString(),
    });
  }
  return suppliers;
};

export const mockSuppliers: Supplier[] = generateSuppliers(10);
