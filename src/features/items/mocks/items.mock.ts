import { Item } from "../item.schema"
import { mockCategories } from "../../categories/mocks/categories.mock"

const itemData = [
  { name: "iPhone 15 Pro", sku: "APL-IP15P-256", price: 999, cost: 800, brandId: "brand-100", serialized: true },
  { name: "Galaxy S24 Ultra", sku: "SAM-S24U-512", price: 1299, cost: 1000, brandId: "brand-101", serialized: true },
  { name: "Screen Replacement Kit", sku: "SP-GEN-SCN01", price: 49.99, cost: 20, brandId: "brand-100", serialized: false },
  { name: "USB-C Charger", sku: "ACC-USBC-20W", price: 19.99, cost: 5, brandId: "brand-100", serialized: false },
  { name: "Pixel 8 Pro", sku: "GOO-P8P-128", price: 899, cost: 700, brandId: "brand-105", serialized: true },
];

const generateItems = (count: number): Item[] => {
  const items: Item[] = [];
  for (let i = 0; i < count; i++) {
    const itemInfo = itemData[i % itemData.length];
    const category = mockCategories[i % mockCategories.length];

    items.push({
      id: `item-${String(100 + i).padStart(3, '0')}`,
      name: i >= itemData.length ? `${itemInfo.name} ${Math.floor(i / itemData.length) + 1}` : itemInfo.name,
      subtitle: i % 3 === 0 ? "Global Version" : "",
      sku: i >= itemData.length ? `${itemInfo.sku}-${i}` : itemInfo.sku,
      
      categoryId: category.id,
      brandId: itemInfo.brandId,
      modelId: `model-${i % 5}`,
      supplierId: `sup-${100 + (i % 3)}`,
      boxNumberId: `box-${10 + (i % 5)}`,
      
      purchasePrice: itemInfo.cost,
      salePrice: itemInfo.price,
      minStockLevel: 5,
      
      isSerialized: itemInfo.serialized,
      
      isActive: true,
      isTouchScreen: itemInfo.serialized,
      isSolidDevice: true,
      condition: i % 4 === 0 ? "USED" : "NEW",
      
      deviceType: "Smartphone",
      color: "Black",
      ram: "8GB",
      rom: "256GB",
      
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  return items;
};

export const mockItems: Item[] = generateItems(30);