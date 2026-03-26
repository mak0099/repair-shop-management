import { Item } from "../item.schema"
import { mockCategories } from "../../categories/mocks/categories.mock"

const deviceData = [
  { name: "iPhone 15 Pro", sku: "APL-IP15P-256", salePrice: 999, purchasePrice: 800, brandId: "brand-100", modelId: "model-1", serialized: true },
  { name: "Galaxy S24 Ultra", sku: "SAM-S24U-512", salePrice: 1299, purchasePrice: 1000, brandId: "brand-101", modelId: "model-2", serialized: true },
  { name: "Pixel 8 Pro", sku: "GOO-P8P-128", salePrice: 899, purchasePrice: 700, brandId: "brand-105", modelId: "model-3", serialized: true },
]

const partData = [
  { name: "Battery 3000mAh", sku: "BATT-IP13-3000", salePrice: 49.99, purchasePrice: 20, partType: "Battery", size: "3000mAh" },
  { name: "Screen Display", sku: "SCR-IP13-AMOLED", salePrice: 89.99, purchasePrice: 30, partType: "Screen/Display", size: "6.1 inch" },
  { name: "USB-C Charger", sku: "CHG-USBC-20W", salePrice: 19.99, purchasePrice: 5, partType: "Charger", size: "20W" },
  { name: "Lightning Cable", sku: "CBL-LIGHT-1M", salePrice: 14.99, purchasePrice: 3, partType: "Cable", size: "1M" },
  { name: "iPhone Housing", sku: "HOUS-IP15-BLK", salePrice: 34.99, purchasePrice: 12, partType: "Housing/Body", size: "Full Body" },
  { name: "Memory Module 8GB", sku: "RAM-DDR4-8GB", salePrice: 29.99, purchasePrice: 10, partType: "Memory Module", size: "8GB" },
]

const serviceData = [
  { name: "Phone Flash/Reset", sku: "SVC-FLASH-001", serviceType: "Phone Flash/Reset" },
  { name: "OS Installation", sku: "SVC-OS-001", serviceType: "OS Installation" },
  { name: "Data Recovery", sku: "SVC-DATA-REC", serviceType: "Data Recovery" },
  { name: "Screen Guard Installation", sku: "SVC-GUARD-001", serviceType: "Screen Guard Installation" },
  { name: "Software Installation", sku: "SVC-SOFT-001", serviceType: "Software Installation" },
]

const loanerData = [
  { name: "iPhone 12 Pro", sku: "LOAN-IP12P-001", brandId: "brand-100", modelId: "model-1", imei: "350776103667460", condition: "USED" },
  { name: "iPhone 12 Pro", sku: "LOAN-IP12P-002", brandId: "brand-100", modelId: "model-1", imei: "350776103667461", condition: "NEW" },
  { name: "Galaxy S21", sku: "LOAN-S21-001", brandId: "brand-101", modelId: "model-2", imei: "352884113159220", condition: "USED" },
]

const generateItems = (count: number): Item[] => {
  const items: Item[] = [];
  
  // Add DEVICE items
  for (let i = 0; i < Math.min(10, count); i++) {
    const device = deviceData[i % deviceData.length];
    const category = mockCategories[i % mockCategories.length];

    items.push({
      id: `item-dev-${String(100 + i).padStart(3, '0')}`,
      name: device.name,
      subtitle: i % 3 === 0 ? "Global Version" : i % 3 === 1 ? "128GB" : "256GB",
      sku: device.sku,
      
      categoryId: category.id,
      brandId: device.brandId,
      modelId: device.modelId,
      supplierId: `sup-${100 + (i % 3)}`,
      boxNumberId: `box-${10 + (i % 5)}`,
      
      purchasePrice: device.purchasePrice,
      salePrice: device.salePrice,
      minStockLevel: 5,
      
      itemType: "DEVICE",
      isSerialized: device.serialized,
      
      isActive: true,
      isTouchScreen: true,
      isSolidDevice: true,
      condition: i % 4 === 0 ? "USED" : i % 4 === 1 ? "REFURBISHED" : "NEW",
      
      deviceType: "Smartphone",
      color: i % 3 === 0 ? "Black" : i % 3 === 1 ? "Silver" : "Blue",
      ram: "8GB",
      rom: "256GB",
      processor: "A17 Pro",
      camera: "48MP",
      
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      quantity: Math.floor(Math.random() * 50) + 1,
    } as any);
  }
  
  // Add PART items
  for (let i = 0; i < Math.min(12, count - 10); i++) {
    const part = partData[i % partData.length];
    const category = mockCategories[i % mockCategories.length];

    items.push({
      id: `item-part-${String(100 + i).padStart(3, '0')}`,
      name: part.name,
      subtitle: part.partType,
      sku: part.sku,
      
      categoryId: category.id,
      brandId: "brand-100",
      modelId: "model-1",
      supplierId: `sup-${100 + (i % 3)}`,
      
      purchasePrice: part.purchasePrice,
      salePrice: part.salePrice,
      minStockLevel: 10,
      
      itemType: "PART",
      partType: part.partType,
      size: part.size,
      partSpecifications: `Compatible with iPhone 13/14/15 series. Quality: Premium OEM equivalent`,
      compatibility: "iPhone 13, iPhone 14, iPhone 15 series",
      
      isSerialized: false,
      
      isActive: true,
      condition: "NEW",
      
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      quantity: Math.floor(Math.random() * 100) + 10,
    } as any);
  }
  
  // Add SERVICE items
  for (let i = 0; i < Math.min(5, count - 22); i++) {
    const service = serviceData[i % serviceData.length];
    const category = mockCategories[i % mockCategories.length];

    items.push({
      id: `item-svc-${String(100 + i).padStart(3, '0')}`,
      name: service.name,
      sku: service.sku,
      
      categoryId: category.id,
      supplierId: `sup-${100 + (i % 3)}`,
      
      purchasePrice: 0,
      salePrice: 0,
      
      itemType: "SERVICE",
      serviceType: service.serviceType,
      
      isActive: true,
      
      description: `Professional ${service.serviceType} service. Quick turnaround time.`,
      note: `Service available Monday - Saturday, 10 AM - 6 PM`,
      
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as any);
  }
  
  // Add LOANER items
  for (let i = 0; i < Math.min(3, count - 27); i++) {
    const loaner = loanerData[i % loanerData.length];
    const category = mockCategories[0]; // Use first category for loaner

    items.push({
      id: `item-loan-${String(100 + i).padStart(3, '0')}`,
      name: loaner.name,
      sku: loaner.sku,
      
      categoryId: category.id,
      brandId: loaner.brandId,
      modelId: loaner.modelId,
      supplierId: `sup-100`,
      boxNumberId: `box-${10 + i}`,
      
      purchasePrice: 800,
      salePrice: 0, // Loaner units not for sale
      minStockLevel: 2,
      
      itemType: "LOANER",
      imei: loaner.imei,
      
      isSerialized: true,
      
      isActive: true,
      condition: loaner.condition,
      
      color: "Black",
      ram: "6GB",
      rom: "128GB",
      
      storageNote: `Loaner unit - Keep in staff room shelf`,
      description: `Temporary loaner device for customer use during service`,
      note: `IMEI tracked for security. Must be returned with customer pickup.`,
      
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      quantity: 1,
    } as any);
  }
  
  // Log generated items for debugging
  const deviceCount = items.filter(i => i.itemType === "DEVICE").length;
  const partCount = items.filter(i => i.itemType === "PART").length;
  const serviceCount = items.filter(i => i.itemType === "SERVICE").length;
  const loanerCount = items.filter(i => i.itemType === "LOANER").length;
  
  console.log(`[MockItems] Generated ${items.length} total items: ${deviceCount} DEVICE, ${partCount} PART, ${serviceCount} SERVICE, ${loanerCount} LOANER`);
  
  return items;
};

export const mockItems: Item[] = generateItems(30);