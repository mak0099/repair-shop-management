import { Category } from "../category.schema"

const categoryData = [
  { name: "Electronics", description: "All kinds of electronic devices" },
  { name: "Smartphones", description: "Mobile phones with advanced features", parent_id: "cat-100" },
  { name: "Laptops", description: "Portable computers", parent_id: "cat-100" },
  { name: "Accessories", description: "Chargers, cases, and more" },
  { name: "Cases", description: "Protective cases for devices", parent_id: "cat-103" },
];

const generateCategories = (count: number): Category[] => {
  const categories: Category[] = [];
  for (let i = 0; i < count; i++) {
    const categoryInfo = categoryData[i % categoryData.length];
    const isDuplicate = i >= categoryData.length;
    categories.push({
      id: `cat-${String(100 + i).padStart(3, '0')}`,
      name: isDuplicate ? `${categoryInfo.name} ${Math.floor(i / categoryData.length) + 1}` : categoryInfo.name,
      description: categoryInfo.description,
      parent_id: categoryInfo.parent_id,
      isActive: i % 10 !== 0,
      createdAt: new Date(Date.now() - (count - i) * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - (count - i) * 12 * 60 * 60 * 1000).toISOString(),
    });
  }
  return categories;
};

export const mockCategories: Category[] = generateCategories(10);
