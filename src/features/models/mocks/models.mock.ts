import { Model } from "../model.schema"

const modelData = [
  { name: "iPhone 15 Pro", brand_id: "brand-100" },
  { name: "iPhone 15", brand_id: "brand-100" },
  { name: "Galaxy S24 Ultra", brand_id: "brand-101" },
  { name: "Galaxy S24", brand_id: "brand-101" },
  { name: "P80 Pro", brand_id: "brand-102" },
  { name: "Find X", brand_id: "brand-104" },
  { name: "Pixel 8 Pro", brand_id: "brand-105" },
  { name: "Nord", brand_id: "brand-106" },
];

const generateModels = (count: number): Model[] => {
  const models: Model[] = [];
  for (let i = 0; i < count; i++) {
    const modelInfo = modelData[i % modelData.length];
    const isDuplicate = i >= modelData.length;
    models.push({
      id: `model-${String(100 + i).padStart(3, '0')}`,
      name: isDuplicate ? `${modelInfo.name} ${Math.floor(i / modelData.length) + 1}` : modelInfo.name,
      brand_id: modelInfo.brand_id,
      isActive: i % 8 !== 0,
      createdAt: new Date(Date.now() - (count - i) * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - (count - i) * 12 * 60 * 60 * 1000).toISOString(),
    });
  }
  return models;
};

export const mockModels: Model[] = generateModels(20);
