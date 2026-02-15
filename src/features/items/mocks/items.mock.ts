import { Item } from "../item.schema"

const itemData = [
  { name: "iPhone 15 Pro", sku: "APL-IP15P-256", type: "PRODUCT", price: 999, cost: 800, brand_id: "brand-100" },
  { name: "Galaxy S24 Ultra", sku: "SAM-S24U-512", type: "PRODUCT", price: 1299, cost: 1000, brand_id: "brand-101" },
  { name: "Screen Replacement Kit", sku: "SP-GEN-SCN01", type: "SPARE_PART", price: 49.99, cost: 20, brand_id: "brand-100" },
  { name: "USB-C Charger", sku: "ACC-USBC-20W", type: "ACCESSORY", price: 19.99, cost: 5, brand_id: "brand-100" },
  { name: "Pixel 8 Pro", sku: "GOO-P8P-128", type: "PRODUCT", price: 899, cost: 700, brand_id: "brand-105" },
  { name: "Wireless Charging Pad", sku: "ACC-WLC-15W", type: "ACCESSORY", price: 29.99, cost: 10, brand_id: "brand-101" },
  { name: "Battery for S22", sku: "SP-SAM-S22BAT", type: "SPARE_PART", price: 39.99, cost: 15, brand_id: "brand-101" },
];

const generateItems = (count: number): Item[] => {
  const items: Item[] = [];
  for (let i = 0; i < count; i++) {
    const itemInfo = itemData[i % itemData.length];
    const isDuplicate = i >= itemData.length;
    items.push({
      id: `item-${String(100 + i).padStart(3, '0')}`,
      name: isDuplicate ? `${itemInfo.name} ${Math.floor(i / itemData.length) + 1}` : itemInfo.name,
      sku: isDuplicate ? `${itemInfo.sku}-${i}` : itemInfo.sku,
      type: itemInfo.type as Item['type'],
      brand_id: itemInfo.brand_id,
      model_id: itemInfo.type === 'PRODUCT' ? `model-${String(100 + (i % 5)).padStart(3, '0')}` : undefined,
      price: itemInfo.price + (isDuplicate ? i*10 : 0),
      cost_price: itemInfo.cost + (isDuplicate ? i*5 : 0),
      stock_qty: Math.floor(Math.random() * 100),
      specifications: {
          color: ['Black', 'White', 'Blue', 'Red'][i%4],
          notes: "Generated mock data"
      },
      isActive: i % 7 !== 0,
      createdAt: new Date(Date.now() - (count - i) * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - (count - i) * 12 * 60 * 60 * 1000).toISOString(),
    });
  }
  return items;
};

export const mockItems: Item[] = generateItems(30);
