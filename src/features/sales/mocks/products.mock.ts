import { POSProduct } from "../pos-context";

const productSeeds = [
  { name: "iPhone 15 Pro", sku: "APL-IP15P-256", price: 145000, stock: 10 },
  { name: "Galaxy S24 Ultra", sku: "SAM-S24U-512", price: 135000, stock: 5 },
  { name: "iPhone 13 OLED Screen", sku: "SP-IP13-DISP", price: 12000, stock: 15 },
  { name: "20W USB-C Adapter", sku: "ACC-20W-PWR", price: 2500, stock: 50 },
];

const serviceSeeds = [
  { name: "Display Replacement Labor", price: 1500 },
  { name: "Software Flashing / Unlock", price: 1000 },
  { name: "Motherboard Shorting Repair", price: 3500 },
];

const generatePOSProducts = (productCount: number, serviceCount: number): POSProduct[] => {
  const products: POSProduct[] = [];
  
  // Products
  for (let i = 0; i < productCount; i++) {
    const info = productSeeds[i % productSeeds.length];
    products.push({
      id: `p-item-${100 + i}`,
      name: i >= productSeeds.length ? `${info.name} (${Math.floor(i/4)})` : info.name,
      sku: `${info.sku}-${i}`,
      salePrice: info.price,
      type: "PRODUCT",
      stock: Math.floor(Math.random() * 20) + 1,
    });
  }

  // Services
  for (let j = 0; j < serviceCount; j++) {
    const info = serviceSeeds[j % serviceSeeds.length];
    products.push({
      id: `s-item-${500 + j}`,
      name: info.name,
      salePrice: info.price,
      type: "SERVICE",
    });
  }

  return products;
};

export const mockPOSProducts = generatePOSProducts(15, 5);